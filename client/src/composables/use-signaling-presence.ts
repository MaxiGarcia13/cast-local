import type { PeerInfo, ServerMessage } from '@roomcast/shared';
import { ref } from 'vue';

export function useSignalingPresence() {
  const peers = ref<PeerInfo[]>([]);
  const self = ref<PeerInfo | null>(null);
  const roomClosed = ref(false);

  function reset() {
    peers.value = [];
    self.value = null;
    roomClosed.value = false;
  }

  function handleMessage(message: ServerMessage): boolean {
    switch (message.type) {
      case 'welcome':
        self.value = message.peer;
        return true;
      case 'peers':
        peers.value = message.peers;
        return true;
      case 'peer-joined':
        if (!peers.value.some((peer) => peer.id === message.peer.id)) {
          peers.value = [...peers.value, message.peer];
        }
        return true;
      case 'peer-updated':
        if (self.value?.id === message.peer.id) {
          self.value = message.peer;
        }
        peers.value = peers.value.map((peer) => {
          return peer.id === message.peer.id ? message.peer : peer;
        });
        return true;
      case 'peer-left':
        peers.value = peers.value.filter((peer) => peer.id !== message.id);
        return true;
      case 'room-closed':
        roomClosed.value = true;
        return true;
      default:
        return false;
    }
  }

  return {
    peers,
    roomClosed,
    reset,
    handleMessage,
  };
}
