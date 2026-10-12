import type { useSignaling } from './use-signaling';
import { navigate } from 'astro:transitions/client';
import { onMounted, onUnmounted } from 'vue';
import { hasSharePayload } from '@/stores/share-payload';

export type RoomRole = 'host' | 'guest';

type Signaling = ReturnType<typeof useSignaling>;

interface UseRoomSessionOptions {
  roomId: string;
  role: RoomRole;
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

    if (options.role === 'host' && !hasSharePayload.get()) {
      navigate('/', { history: 'replace' });
      return;
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
