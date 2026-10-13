import type {
  ClientMessage,
  IceCandidate,
  ServerMessage,
  SessionDescription,
} from '@cast-local/shared';
import { ref } from 'vue';

export interface QueuedIceCandidate {
  from: string;
  candidate: IceCandidate | null;
}

export function useSignalingRtc(send: (message: ClientMessage) => void) {
  const lastRtcOffer = ref<{ from: string; sdp: SessionDescription } | null>(null);
  const lastRtcAnswer = ref<{ from: string; sdp: SessionDescription } | null>(null);
  const iceVersion = ref(0);
  const iceQueue: QueuedIceCandidate[] = [];

  function handleMessage(message: ServerMessage): boolean {
    switch (message.type) {
      case 'rtc-offer':
        lastRtcOffer.value = { from: message.from, sdp: message.sdp };
        return true;
      case 'rtc-answer':
        lastRtcAnswer.value = { from: message.from, sdp: message.sdp };
        return true;
      case 'ice-candidate':
        iceQueue.push({ from: message.from, candidate: message.candidate });
        iceVersion.value += 1;
        return true;
      default:
        return false;
    }
  }

  function takeIceCandidates(): QueuedIceCandidate[] {
    return iceQueue.splice(0, iceQueue.length);
  }

  function sendRtcOffer(to: string, sdp: SessionDescription) {
    send({ type: 'rtc-offer', to, sdp });
  }

  function sendRtcAnswer(to: string, sdp: SessionDescription) {
    send({ type: 'rtc-answer', to, sdp });
  }

  function sendIceCandidate(to: string, candidate: IceCandidate | null) {
    send({ type: 'ice-candidate', to, candidate });
  }

  function reset() {
    lastRtcOffer.value = null;
    lastRtcAnswer.value = null;
    iceQueue.length = 0;
    iceVersion.value = 0;
  }

  return {
    lastRtcOffer,
    lastRtcAnswer,
    iceVersion,
    takeIceCandidates,
    handleMessage,
    sendRtcOffer,
    sendRtcAnswer,
    sendIceCandidate,
    reset,
  };
}
