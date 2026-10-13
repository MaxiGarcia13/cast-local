import type { SendPayload, TransferProgress } from './transfer-progress';
import { ref } from 'vue';
import { attachTransferReceiver } from './attach-receiver';
import { sendTransferPayload } from './send-payload';
import {
  applyTransferError,
  createIdleProgress,

} from './transfer-progress';

export function useFileTransfer() {
  const progress = ref<TransferProgress>(createIdleProgress());

  let receiverCleanup: (() => void) | null = null;

  function resetProgress() {
    progress.value = createIdleProgress();
  }

  function setError(error: unknown, fallback = 'Transfer failed') {
    progress.value = applyTransferError(progress.value, error, fallback);
  }

  async function sendPayload(channel: RTCDataChannel, payload: SendPayload) {
    await sendTransferPayload(channel, payload, progress);
  }

  function attachReceiver(channel: RTCDataChannel) {
    receiverCleanup?.();
    receiverCleanup = attachTransferReceiver(channel, progress, setError);
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
