<script setup lang="ts">
import QRCode from 'qrcode';
import { computed, onMounted, ref, watch } from 'vue';
import { roomJoinPath } from '@/utils/room-id';

const props = defineProps<{
  roomId: string;
}>();

const qrDataUrl = ref<string | null>(null);
const copyState = ref<'idle' | 'copied' | 'failed'>('idle');

const roomUrl = computed(() => {
  const path = roomJoinPath(props.roomId);
  if (typeof window === 'undefined') {
    return path;
  }
  return `${window.location.origin}${path}`;
});

async function renderQr(url: string) {
  try {
    qrDataUrl.value = await QRCode.toDataURL(url, {
      margin: 1,
      width: 192,
      color: {
        dark: '#0a1228',
        light: '#ffffff',
      },
    });
  } catch {
    qrDataUrl.value = null;
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(roomUrl.value);
    copyState.value = 'copied';
    window.setTimeout(() => {
      copyState.value = 'idle';
    }, 1500);
  } catch {
    copyState.value = 'failed';
  }
}

onMounted(() => {
  void renderQr(roomUrl.value);
});

watch(roomUrl, (url) => {
  void renderQr(url);
});
</script>

<template>
  <div class="flex w-full max-w-md flex-col items-center gap-4 rounded-xl bg-cast-panel/80 px-4 py-6">
    <p class="text-sm font-medium text-cast-fog">
      Invite to this room
    </p>

    <img
      v-if="qrDataUrl"
      :src="qrDataUrl"
      alt="Room QR code"
      class="size-48 rounded-xl bg-white p-2"
    >

    <p class="w-full break-all rounded-xl bg-cast-ink/50 px-4 py-2 text-center text-xs text-cast-mist">
      {{ roomUrl }}
    </p>

    <button
      type="button"
      class="rounded-xl bg-cast-signal px-4 py-2 text-sm font-semibold text-cast-ink transition hover:brightness-110"
      @click="copyLink"
    >
      {{ copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy failed' : 'Copy link' }}
    </button>
  </div>
</template>
