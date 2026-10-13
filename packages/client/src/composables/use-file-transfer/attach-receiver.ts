import type { DataChannelControl, FileMeta } from '@roomcast/shared';
import type { Ref } from 'vue';
import type { TransferProgress } from './transfer-progress';
import type { DownloadableFile } from '@/utils/download-files';
import { assembleFile, chunkCount, decodeChunk } from '@/domain/p2p';
import { downloadFiles } from '@/utils/download-files';

export function attachTransferReceiver(
  channel: RTCDataChannel,
  progress: Ref<TransferProgress>,
  setError: (error: unknown, fallback?: string) => void,
): () => void {
  const filesById = new Map<string, FileMeta>();
  const chunksByFileId = new Map<string, Map<number, Uint8Array>>();
  const completedFiles: string[] = [];
  const receivedFiles: DownloadableFile[] = [];
  let bytesTotal = 0;
  let bytesDone = 0;
  let receivedText: string | null = null;

  progress.value = {
    phase: 'receiving',
    bytesDone: 0,
    bytesTotal: 0,
    filesDone: 0,
    filesTotal: 0,
    currentFileName: null,
    completedFiles: [],
    receivedText: null,
    error: null,
  };

  const onMessage = (event: MessageEvent) => {
    try {
      if (typeof event.data === 'string') {
        handleControlMessage(JSON.parse(event.data) as DataChannelControl);
        return;
      }

      const chunk = decodeChunk(event.data as ArrayBuffer);
      let fileChunks = chunksByFileId.get(chunk.fileId);
      if (!fileChunks) {
        fileChunks = new Map();
        chunksByFileId.set(chunk.fileId, fileChunks);
      }
      fileChunks.set(chunk.index, chunk.payload);

      bytesDone += chunk.payload.byteLength;
      const meta = filesById.get(chunk.fileId);
      progress.value = {
        ...progress.value,
        bytesDone: Math.min(bytesDone, bytesTotal || bytesDone),
        bytesTotal: bytesTotal || progress.value.bytesTotal,
        currentFileName: meta?.name ?? progress.value.currentFileName,
      };
    } catch (error) {
      setError(error, 'Could not process an incoming file chunk');
    }
  };

  async function finalizeReceive() {
    try {
      await downloadFiles(receivedFiles);
      progress.value = {
        ...progress.value,
        phase: 'complete',
        bytesDone: bytesTotal || bytesDone,
        filesDone: completedFiles.length,
        currentFileName: null,
        completedFiles: [...completedFiles],
        receivedText,
      };
    } catch (error) {
      setError(error, 'Could not save received files');
    }
  }

  function handleControlMessage(message: DataChannelControl) {
    if (message.type === 'manifest') {
      bytesTotal = message.files.reduce((sum, file) => sum + file.size, 0);
      for (const file of message.files) {
        filesById.set(file.id, file);
      }
      progress.value = {
        phase: 'receiving',
        bytesDone: 0,
        bytesTotal,
        filesDone: 0,
        filesTotal: message.files.length,
        currentFileName: message.hasText ? 'Text' : message.files[0]?.name ?? null,
        completedFiles: [],
        receivedText: null,
        error: null,
      };
      return;
    }

    if (message.type === 'text') {
      receivedText = message.text;
      const textBytes = new TextEncoder().encode(message.text).byteLength;
      bytesDone += textBytes;
      if (bytesTotal === 0) {
        bytesTotal = textBytes;
      }
      progress.value = {
        ...progress.value,
        receivedText,
        bytesDone: Math.min(bytesDone, bytesTotal || bytesDone),
        bytesTotal: bytesTotal || progress.value.bytesTotal,
        currentFileName: filesById.size > 0
          ? [...filesById.values()][0]?.name ?? null
          : null,
      };
      return;
    }

    if (message.type === 'file-complete') {
      const meta = filesById.get(message.fileId);
      const fileChunks = chunksByFileId.get(message.fileId);
      if (!meta || !fileChunks) {
        setError(`Missing data for file ${message.fileId}`);
        return;
      }

      const total = chunkCount(meta.size);
      const blob = assembleFile(fileChunks, total, meta.type);
      receivedFiles.push({ name: meta.name, blob });
      chunksByFileId.delete(message.fileId);
      completedFiles.push(meta.name);

      progress.value = {
        ...progress.value,
        filesDone: completedFiles.length,
        completedFiles: [...completedFiles],
      };
      return;
    }

    if (message.type === 'transfer-complete') {
      void finalizeReceive();
      return;
    }

    if (message.type === 'transfer-error') {
      setError(message.message);
    }
  }

  const onChannelError = () => {
    setError('Data channel failed during transfer');
  };

  channel.addEventListener('message', onMessage);
  channel.addEventListener('error', onChannelError);

  return () => {
    channel.removeEventListener('message', onMessage);
    channel.removeEventListener('error', onChannelError);
  };
}
