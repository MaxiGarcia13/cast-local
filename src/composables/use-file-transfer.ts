import type { DataChannelControl, FileMeta, TransferManifest } from '@/domain/p2p';
import { ref } from 'vue';
import {
  assembleFile,
  chunkCount,
  decodeChunk,
  encodeChunk,
  readChunk,
} from '@/domain/p2p';
import { downloadBlob } from '@/utils/download-blob';

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
  currentFileName: string | null;
  error: string | null;
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

export function useFileTransfer() {
  const progress = ref<TransferProgress>({
    phase: 'idle',
    bytesDone: 0,
    bytesTotal: 0,
    currentFileName: null,
    error: null,
  });

  let receiverCleanup: (() => void) | null = null;

  function resetProgress() {
    progress.value = {
      phase: 'idle',
      bytesDone: 0,
      bytesTotal: 0,
      currentFileName: null,
      error: null,
    };
  }

  function setError(message: string) {
    progress.value = {
      ...progress.value,
      phase: 'error',
      error: message,
    };
  }

  async function sendFiles(
    channel: RTCDataChannel,
    files: File[],
    fileMetas: FileMeta[],
  ) {
    await waitForChannelOpen(channel);

    const bytesTotal = fileMetas.reduce((sum, file) => sum + file.size, 0);
    progress.value = {
      phase: 'sending',
      bytesDone: 0,
      bytesTotal,
      currentFileName: fileMetas[0]?.name ?? null,
      error: null,
    };

    const manifest: TransferManifest = {
      type: 'manifest',
      transferId: crypto.randomUUID(),
      files: fileMetas,
    };
    channel.send(JSON.stringify(manifest));

    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      const file = files[fileIndex]!;
      const meta = fileMetas[fileIndex]!;
      progress.value = {
        ...progress.value,
        currentFileName: meta.name,
      };

      const total = chunkCount(file.size);
      for (let index = 0; index < total; index++) {
        await waitForBuffer(channel);
        const payload = await readChunk(file, index);
        channel.send(encodeChunk(meta.id, index, total, payload));
        progress.value = {
          ...progress.value,
          bytesDone: Math.min(
            progress.value.bytesDone + payload.byteLength,
            bytesTotal,
          ),
        };
      }

      const fileComplete: DataChannelControl = { type: 'file-complete', fileId: meta.id };
      channel.send(JSON.stringify(fileComplete));
    }

    const transferComplete: DataChannelControl = { type: 'transfer-complete' };
    channel.send(JSON.stringify(transferComplete));

    progress.value = {
      ...progress.value,
      phase: 'complete',
      bytesDone: bytesTotal,
      currentFileName: null,
    };
  }

  function attachReceiver(channel: RTCDataChannel) {
    receiverCleanup?.();

    const filesById = new Map<string, FileMeta>();
    const chunksByFileId = new Map<string, Map<number, Uint8Array>>();
    let bytesTotal = 0;
    let bytesDone = 0;

    progress.value = {
      phase: 'receiving',
      bytesDone: 0,
      bytesTotal: 0,
      currentFileName: null,
      error: null,
    };

    const onMessage = (event: MessageEvent) => {
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
          currentFileName: message.files[0]?.name ?? null,
          error: null,
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
        return;
      }

      if (message.type === 'transfer-complete') {
        progress.value = {
          ...progress.value,
          phase: 'complete',
          bytesDone: bytesTotal || bytesDone,
          currentFileName: null,
        };
        return;
      }

      if (message.type === 'transfer-error') {
        setError(message.message);
      }
    }

    channel.addEventListener('message', onMessage);
    receiverCleanup = () => {
      channel.removeEventListener('message', onMessage);
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
    sendFiles,
    attachReceiver,
    stopReceiver,
  };
}
