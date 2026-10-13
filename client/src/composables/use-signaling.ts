import type { ServerMessage } from '@roomcast/shared';
import { onUnmounted } from 'vue';
import { useSignalingPresence } from './use-signaling-presence';
import { useSignalingRtc } from './use-signaling-rtc';
import { useSignalingSocket } from './use-signaling-socket';
import { useSignalingTransfer } from './use-signaling-transfer';

export type { IncomingOffer, SignalingStatus } from './signaling-types';

export function useSignaling() {
  const presence = useSignalingPresence();

  const socket = useSignalingSocket({
    onMessage: handleServerMessage,
    onDisconnected: resetSession,
  });

  const transfer = useSignalingTransfer(socket.send);
  const rtc = useSignalingRtc(socket.send);

  function resetSession() {
    presence.reset();
    transfer.reset();
    rtc.reset();
  }

  function handleServerMessage(message: ServerMessage) {
    if (presence.handleMessage(message)) {
      return;
    }
    if (transfer.handleMessage(message)) {
      return;
    }
    if (rtc.handleMessage(message)) {
      return;
    }
    if (message.type === 'error') {
      socket.setError(message.message);
    }
  }

  onUnmounted(() => {
    socket.disconnect();
  });

  return {
    peers: presence.peers,
    self: presence.self,
    roomClosed: presence.roomClosed,
    status: socket.status,
    lastError: socket.lastError,
    incomingOffer: transfer.incomingOffer,
    lastAcceptFrom: transfer.lastAcceptFrom,
    lastDeclineFrom: transfer.lastDeclineFrom,
    lastRtcOffer: rtc.lastRtcOffer,
    lastRtcAnswer: rtc.lastRtcAnswer,
    iceVersion: rtc.iceVersion,
    takeIceCandidates: rtc.takeIceCandidates,
    currentRoomId: socket.currentRoomId,
    connect: socket.connect,
    disconnect: socket.disconnect,
    updateProfile: socket.updateProfile,
    send: socket.send,
    offerTransfer: transfer.offerTransfer,
    acceptTransfer: transfer.acceptTransfer,
    declineTransfer: transfer.declineTransfer,
    clearIncomingOffer: transfer.clearIncomingOffer,
    sendRtcOffer: rtc.sendRtcOffer,
    sendRtcAnswer: rtc.sendRtcAnswer,
    sendIceCandidate: rtc.sendIceCandidate,
  };
}
