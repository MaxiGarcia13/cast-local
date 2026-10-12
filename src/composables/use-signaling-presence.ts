import type { PeerInfo, ServerMessage } from '@/domain/p2p';
import { ref } from 'vue';

export function useSignalingPresence() {
  const peers = ref<PeerInfo[]>([]);
  const self = ref<PeerInfo | null>(null);

  function reset() {
    peers.value = [];
    self.value = null;
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
      case 'peer-left':
        peers.value = peers.value.filter((peer) => peer.id !== message.id);
        return true;
      default:
        return false;
    }
  }

  return {
    peers,
    self,
    reset,
    handleMessage,
  };
}
