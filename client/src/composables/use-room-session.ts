import type { useSignaling } from './use-signaling';
import { onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { clearSharePayload, hasSharePayload } from '@/stores/share-payload';

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
  const router = useRouter();

  function onPageHide() {
    options.signaling.disconnect();
  }

  function leaveToHome() {
    options.onLeaveCleanup?.();
    options.signaling.disconnect();
    clearSharePayload();
    void router.replace('/');
  }

  onMounted(() => {
    if (!options.roomIsValid()) {
      return;
    }

    if (options.role === 'host' && !hasSharePayload.get()) {
      void router.replace('/');
      return;
    }

    options.signaling.connect({
      roomId: options.roomId,
      asHost: options.role === 'host',
    });
    window.addEventListener('pagehide', onPageHide);
  });

  watch(
    () => options.signaling.roomClosed.value,
    (closed) => {
      if (closed && options.role === 'guest') {
        leaveToHome();
      }
    },
  );

  watch(
    () => options.signaling.lastError.value,
    (error) => {
      if (!error) {
        return;
      }
      if (error === 'Room is not open' || error === 'Room already has a host') {
        leaveToHome();
      }
    },
  );

  onUnmounted(() => {
    window.removeEventListener('pagehide', onPageHide);
    options.onLeaveCleanup?.();
    options.signaling.disconnect();
  });
}
