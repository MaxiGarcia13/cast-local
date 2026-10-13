import type { DataChannelControl, FileMeta, TransferManifest } from '@cast-local/shared';
import { ref } from 'vue';
import {
  assembleFile,
  chunkCount,
  decodeChunk,
  encodeChunk,
  readChunk,
} from '@/p2p';
import { downloadBlob } from '@/utils/download-blob';
import { friendlyTransferError } from '@/utils/transfer-errors';

export type TransferPhase
  = | 'idle'
    | 'sending'
    | 'receiving'
    | 'complete'
    | 'error';

export interface TransferProgress {
  phase: TransferPhase;
  bytesDone: number;
  bytesTotal: number;
  filesDone: number;
  filesTotal: number;
  currentFileName: string | null;
  completedFiles: string[];
  receivedText: string | null;
  error: string | null;
}

export interface SendPayload {
  files: File[];
  fileMetas: FileMeta[];
  text: string | null;
}

const BUFFER_HIGH_WATER_MARK = 256 * 1024;
const BUFFER_LOW_WATER_MARK = 64 * 1024;

function waitForChannelOpen(channel: RTCDataChannel): Promise<void> {
  if (channel.readyState === 'open') {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    function cleanup() {
      channel.removeEventListener('open', onOpen);
      channel.removeEventListener('error', onError);
    }
    function onOpen() {
      cleanup();
      resolve();
    }
    function onError() {
      cleanup();
      reject(new Error('Data channel failed to open'));
    }
    channel.addEventListener('open', onOpen);
    channel.addEventListener('error', onError);
  });
}

function waitForBuffer(channel: RTCDataChannel): Promise<void> {
  if (channel.bufferedAmount <= BUFFER_HIGH_WATER_MARK) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    channel.bufferedAmountLowThreshold = BUFFER_LOW_WATER_MARK;
    const onLow = () => {
      channel.removeEventListener('bufferedamountlow', onLow);
      resolve();
    };
    channel.addEventListener('bufferedamountlow', onLow);
  });
}

function createIdleProgress(): TransferProgress {
  return {
    phase: 'idle',
    bytesDone: 0,
    bytesTotal: 0,
    filesDone: 0,
    filesTotal: 0,
    currentFileName: null,
    completedFiles: [],
    receivedText: null,
    error: null,
  };
}

export function useFileTransfer() {
  const progress = ref<TransferProgress>(createIdleProgress());

  let receiverCleanup: (() => void) | null = null;

  function resetProgress() {
    progress.value = createIdleProgress();
  }

  function setError(error: unknown, fallback = 'Transfer failed') {
    progress.value = {
      ...progress.value,
      phase: 'error',
      error: friendlyTransferError(error, fallback),
      currentFileName: null,
    };
  }

  async function sendPayload(channel: RTCDataChannel, payload: SendPayload) {
    await waitForChannelOpen(channel);

    const text = payload.text?.trim() ? payload.text : null;
    const bytesTotal = payload.fileMetas.reduce((sum, file) => sum + file.size, 0)
      + (text ? new TextEncoder().encode(text).byteLength : 0);
    const completedFiles: string[] = [];

    progress.value = {
      phase: 'sending',
      bytesDone: 0,
      bytesTotal,
      filesDone: 0,
      filesTotal: payload.fileMetas.length,
      currentFileName: text ? 'Text' : payload.fileMetas[0]?.name ?? null,
      completedFiles: [],
      receivedText: null,
      error: null,
    };

    const manifest: TransferManifest = {
      type: 'manifest',
      transferId: crypto.randomUUID(),
      files: payload.fileMetas,
      hasText: Boolean(text),
    };
    channel.send(JSON.stringify(manifest));

    if (text) {
      const textMessage: DataChannelControl = { type: 'text', text };
      channel.send(JSON.stringify(textMessage));
      progress.value = {
        ...progress.value,
        bytesDone: Math.min(
          progress.value.bytesDone + new TextEncoder().encode(text).byteLength,
          bytesTotal,
        ),
        currentFileName: payload.fileMetas[0]?.name ?? null,
      };
    }

    for (let fileIndex = 0; fileIndex < payload.files.length; fileIndex++) {
      const file = payload.files[fileIndex]!;
      const meta = payload.fileMetas[fileIndex]!;
      progress.value = {
        ...progress.value,
        currentFileName: meta.name,
      };

      const total = chunkCount(file.size);
      for (let index = 0; index < total; index++) {
        await waitForBuffer(channel);
        if (channel.readyState !== 'open') {
          throw new Error('Data channel closed during send');
        }
        const chunkPayload = await readChunk(file, index);
        channel.send(encodeChunk(meta.id, index, total, chunkPayload));
        progress.value = {
          ...progress.value,
          bytesDone: Math.min(
            progress.value.bytesDone + chunkPayload.byteLength,
            bytesTotal,
          ),
        };
      }

      completedFiles.push(meta.name);
      progress.value = {
        ...progress.value,
        filesDone: completedFiles.length,
        completedFiles: [...completedFiles],
      };

      const fileComplete: DataChannelControl = { type: 'file-complete', fileId: meta.id };
      channel.send(JSON.stringify(fileComplete));
    }

    const transferComplete: DataChannelControl = { type: 'transfer-complete' };
    channel.send(JSON.stringify(transferComplete));

    progress.value = {
      ...progress.value,
      phase: 'complete',
      bytesDone: bytesTotal,
      filesDone: payload.fileMetas.length,
      currentFileName: null,
      completedFiles: [...completedFiles],
    };
  }

  function attachReceiver(channel: RTCDataChannel) {
    receiverCleanup?.();

    const filesById = new Map<string, FileMeta>();
    const chunksByFileId = new Map<string, Map<number, Uint8Array>>();
    const completedFiles: string[] = [];
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
        downloadBlob(blob, meta.name);
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
        progress.value = {
          ...progress.value,
          phase: 'complete',
          bytesDone: bytesTotal || bytesDone,
          filesDone: completedFiles.length,
          currentFileName: null,
          completedFiles: [...completedFiles],
          receivedText,
        };
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
    receiverCleanup = () => {
      channel.removeEventListener('message', onMessage);
      channel.removeEventListener('error', onChannelError);
      receiverCleanup = null;
    };
  }

  function stopReceiver() {
    receiverCleanup?.();
    receiverCleanup = null;
  }

  return {
    progress,
    resetProgress,
    setError,
    sendPayload,
    attachReceiver,
    stopReceiver,
  };
}
