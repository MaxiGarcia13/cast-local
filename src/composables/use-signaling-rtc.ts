import type {
  ClientMessage,
  IceCandidate,
  ServerMessage,
  SessionDescription,
} from '@/domain/p2p';
import { ref } from 'vue';

export function useSignalingRtc(send: (message: ClientMessage) => void) {
  const lastRtcOffer = ref<{ from: string; sdp: SessionDescription } | null>(null);
  const lastRtcAnswer = ref<{ from: string; sdp: SessionDescription } | null>(null);
  const lastIceCandidate = ref<{ from: string; candidate: IceCandidate | null } | null>(null);

  function handleMessage(message: ServerMessage): boolean {
    switch (message.type) {
      case 'rtc-offer':
        lastRtcOffer.value = { from: message.from, sdp: message.sdp };
        return true;
      case 'rtc-answer':
        lastRtcAnswer.value = { from: message.from, sdp: message.sdp };
        return true;
      case 'ice-candidate':
        lastIceCandidate.value = { from: message.from, candidate: message.candidate };
        return true;
      default:
        return false;
    }
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
    lastIceCandidate.value = null;
  }

  return {
    lastRtcOffer,
    lastRtcAnswer,
    lastIceCandidate,
    handleMessage,
    sendRtcOffer,
    sendRtcAnswer,
    sendIceCandidate,
    reset,
  };
}
