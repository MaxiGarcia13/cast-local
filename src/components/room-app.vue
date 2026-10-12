<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import { computed, onMounted, onUnmounted } from 'vue';
import BrandIcon from '@/components/icons/brand.vue';
import ChevronLeftIcon from '@/components/icons/chevron-left.vue';
import RoomInvite from '@/components/room-invite.vue';
import ShareRadar from '@/components/share-radar.vue';
import { useSignaling } from '@/composables/use-signaling';
import {
  hasSharePayload,
  setGuestSharePayload,
  sharePayloadStore,
} from '@/stores/share-payload';
import { guessDeviceName } from '@/utils/device-name';
import { isValidRoomId } from '@/utils/room-id';

const props = defineProps<{
  roomId: string;
}>();

const payload = useStore(sharePayloadStore);
const hasPayload = useStore(hasSharePayload);

const signaling = useSignaling();
const {
  peers,
  self,
  status,
  lastError,
  connect,
  disconnect,
} = signaling;

const roomIsValid = computed(() => isValidRoomId(props.roomId));
const isHost = computed(() => payload.value.isHost);
const selfName = computed(() => self.value?.name ?? guessDeviceName());

const statusLabel = computed(() => {
  switch (status.value) {
    case 'connecting':
      return 'Connecting…';
    case 'connected':
      return 'Connected to room';
    case 'error':
      return lastError.value ?? 'Connection error';
    default:
      return 'Offline';
  }
});

const readySummary = computed(() => {
  if (!isHost.value) {
    return 'Waiting for a transfer…';
  }

  const parts: string[] = [];
  if (payload.value.files.length === 1) {
    parts.push('1 file');
  } else if (payload.value.files.length > 1) {
    parts.push(`${payload.value.files.length} files`);
  }
  if (payload.value.text.trim()) {
    parts.push('text');
  }
  return parts.length ? `${parts.join(' + ')} ready` : 'No files or text loaded';
});

function leaveRoom() {
  disconnect();
  window.location.assign('/');
}

function onPageHide() {
  disconnect();
}

onMounted(() => {
  if (!roomIsValid.value) {
    return;
  }

  if (!payload.value.isHost) {
    setGuestSharePayload();
  }

  connect({ roomId: props.roomId });
  window.addEventListener('pagehide', onPageHide);
});

onUnmounted(() => {
  window.removeEventListener('pagehide', onPageHide);
  disconnect();
});
</script>

<template>
  <div
    class="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6 py-12"
    style="animation: cast-fade-up 0.6s ease-out both"
  >
    <header class="mb-8 flex flex-col items-center gap-4 text-center">
      <BrandIcon class="size-10 text-cast-signal" />
      <p class="font-display text-3xl font-extrabold tracking-tight text-cast-fog md:text-4xl">
        Room {{ roomId }}
      </p>
      <p
        class="text-xs"
        :class="status === 'error' ? 'text-cast-coral' : 'text-cast-mist'"
      >
        {{ statusLabel }}
      </p>
    </header>

    <main
      v-if="!roomIsValid"
      class="flex flex-1 flex-col items-center gap-6 text-center"
    >
      <p class="text-cast-coral">
        This room link is invalid.
      </p>
      <a
        href="/"
        class="rounded-xl bg-cast-signal px-4 py-2 text-sm font-semibold text-cast-ink"
      >
        Back home
      </a>
    </main>

    <main
      v-else
      class="flex flex-1 flex-col items-center gap-8"
    >
      <div class="flex w-full max-w-md items-center justify-between gap-4">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-cast-mist transition hover:text-cast-fog"
          @click="leaveRoom"
        >
          <ChevronLeftIcon class="size-4" />
          Leave
        </button>
        <p class="text-sm text-cast-mist">
          {{ readySummary }}
        </p>
      </div>

      <p
        v-if="isHost && !hasPayload"
        class="max-w-md text-center text-sm text-cast-coral"
      >
        No share payload in memory (page refresh?).
        <a
          href="/"
          class="underline"
        >Go back</a>
        to add files or text, then share again.
      </p>

      <ShareRadar
        v-if="isHost"
        :peers="peers"
        :self-name="selfName"
        :disabled="!hasPayload"
      />

      <template v-else>
        <div class="flex w-full max-w-md flex-col items-center gap-4 rounded-xl bg-cast-panel/80 px-6 py-10 text-center">
          <p class="font-display text-xl font-bold text-cast-fog">
            You are in the room
          </p>
          <p class="text-sm text-cast-mist">
            Stay on this page. When someone sends files or text, you will get an accept prompt.
          </p>
        </div>
      </template>

      <RoomInvite :room-id="roomId" />
    </main>
  </div>
</template>
