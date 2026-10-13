import type { DataChannelControl, TransferManifest } from '@roomcast/shared';
import type { Ref } from 'vue';
import type { SendPayload, TransferProgress } from './transfer-progress';
import { chunkCount, encodeChunk, readChunk } from '@/domain/p2p';
import { waitForBuffer, waitForChannelOpen } from './wait-for-channel';

export async function sendTransferPayload(
  channel: RTCDataChannel,
  payload: SendPayload,
  progress: Ref<TransferProgress>,
) {
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
