import type { IncomingOffer } from './signaling-types';
import type { ClientMessage, FileMeta, ServerMessage } from '@/domain/p2p';
import { ref } from 'vue';

export function useSignalingTransfer(send: (message: ClientMessage) => void) {
  const incomingOffer = ref<IncomingOffer | null>(null);
  const lastAcceptFrom = ref<string | null>(null);
  const lastDeclineFrom = ref<string | null>(null);

  function handleMessage(message: ServerMessage): boolean {
    switch (message.type) {
      case 'offer-transfer':
        incomingOffer.value = {
          from: message.from,
          files: message.files,
          textPreview: message.textPreview ?? null,
        };
        return true;
      case 'accept':
        lastAcceptFrom.value = message.from;
        return true;
      case 'decline':
        lastDeclineFrom.value = message.from;
        return true;
      default:
        return false;
    }
  }

  function offerTransfer(
    to: string,
    files: FileMeta[],
    textPreview: string | null = null,
  ) {
    send({ type: 'offer-transfer', to, files, textPreview });
  }

  function acceptTransfer(to: string) {
    send({ type: 'accept', to });
  }

  function declineTransfer(to: string) {
    send({ type: 'decline', to });
  }

  function clearIncomingOffer() {
    incomingOffer.value = null;
  }

  function reset() {
    incomingOffer.value = null;
    lastAcceptFrom.value = null;
    lastDeclineFrom.value = null;
  }

  return {
    incomingOffer,
    lastAcceptFrom,
    lastDeclineFrom,
    handleMessage,
    offerTransfer,
    acceptTransfer,
    declineTransfer,
    clearIncomingOffer,
    reset,
  };
}
