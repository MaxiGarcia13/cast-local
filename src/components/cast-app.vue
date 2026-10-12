<script setup lang="ts">
import type { PeerInfo } from '@/domain/p2p';
import { computed, onMounted, ref } from 'vue';
import FilePicker from '@/components/file-picker.vue';
import BrandIcon from '@/components/icons/brand.vue';
import ChevronLeftIcon from '@/components/icons/chevron-left.vue';
import CubeSendIcon from '@/components/icons/cube-send.vue';
import ShareRadar from '@/components/share-radar.vue';
import { useSignaling } from '@/composables/use-signaling';
import { guessDeviceName } from '@/utils/device-name';

type Phase = 'pick' | 'radar';

const phase = ref<Phase>('pick');
const files = ref<File[]>([]);
const selectedPeer = ref<PeerInfo | null>(null);

const {
  peers,
  self,
  status,
  lastError,
  connect,
} = useSignaling();

const canShare = computed(() => files.value.length > 0);
const selfName = computed(() => self.value?.name ?? guessDeviceName());
const statusLabel = computed(() => {
  switch (status.value) {
    case 'connecting':
      return 'Connecting…';
    case 'connected':
      return 'Online';
    case 'error':
      return lastError.value ?? 'Connection error';
    default:
      return 'Offline';
  }
});

onMounted(() => {
  connect();
});

function startShare() {
  if (!canShare.value) {
    return;
  }
  selectedPeer.value = null;
  phase.value = 'radar';
}

function backToPick() {
  phase.value = 'pick';
  selectedPeer.value = null;
}

function onSelectPeer(peer: PeerInfo) {
  selectedPeer.value = peer;
}
</script>

<template>
  <div
    class="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6 py-12"
    style="animation: cast-fade-up 0.6s ease-out both"
  >
    <header class="mb-12 flex flex-col items-center gap-4 text-center">
      <BrandIcon class="size-12 text-cast-signal" />
      <p class="font-display text-5xl font-extrabold tracking-tight text-cast-fog md:text-6xl">
        Cast Local
      </p>
      <p class="text-base text-cast-mist md:text-lg">
        Drop files. Find a device. Send over the air on your network.
      </p>
      <p
        class="text-xs"
        :class="status === 'error' ? 'text-cast-coral' : 'text-cast-mist'"
      >
        {{ statusLabel }}
      </p>
    </header>

    <main class="flex flex-1 flex-col items-center gap-8">
      <template v-if="phase === 'pick'">
        <FilePicker v-model="files" />

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-cast-signal px-8 py-4 font-display text-lg font-bold text-cast-ink transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="!canShare"
          @click="startShare"
        >
          <CubeSendIcon class="size-6" />
          Share
        </button>
      </template>

      <template v-else>
        <div class="flex w-full flex-col items-center gap-6">
          <div class="flex w-full max-w-md items-center justify-between gap-4">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-cast-mist transition hover:text-cast-fog"
              @click="backToPick"
            >
              <ChevronLeftIcon class="size-4" />
              Back
            </button>
            <p class="text-sm text-cast-mist">
              {{ files.length }} file{{ files.length === 1 ? '' : 's' }} ready
            </p>
          </div>

          <ShareRadar
            :peers="peers"
            :self-name="selfName"
            @select="onSelectPeer"
          />

          <p
            v-if="selectedPeer"
            class="text-sm text-cast-signal"
          >
            Selected {{ selectedPeer.name }}
          </p>
        </div>
      </template>
    </main>
  </div>
</template>
