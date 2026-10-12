import type { useSignaling } from './use-signaling';
import { onMounted, onUnmounted } from 'vue';
import {
  setGuestSharePayload,
  sharePayloadStore,
} from '@/stores/share-payload';

type Signaling = ReturnType<typeof useSignaling>;

interface UseRoomSessionOptions {
  roomId: string;
  roomIsValid: () => boolean;
  signaling: Signaling;
  onLeaveCleanup?: () => void;
}

export function useRoomSession(options: UseRoomSessionOptions) {
  function onPageHide() {
    options.signaling.disconnect();
  }

  onMounted(() => {
    if (!options.roomIsValid()) {
      return;
    }

    if (!sharePayloadStore.get().isHost) {
      setGuestSharePayload();
    }

    options.signaling.connect({ roomId: options.roomId });
    window.addEventListener('pagehide', onPageHide);
  });

  onUnmounted(() => {
    window.removeEventListener('pagehide', onPageHide);
    options.onLeaveCleanup?.();
    options.signaling.disconnect();
  });
}
