<script setup lang="ts">
import QRCode from 'qrcode';
import { computed, onMounted, ref, watch } from 'vue';
import Button from '@/components/button.vue';
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
      width: 96,
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
  <div class="flex w-full max-w-lg items-center gap-3 rounded-xl bg-cast-panel/80 px-3 py-2.5">
    <img
      v-if="qrDataUrl"
      :src="qrDataUrl"
      alt="Room QR code"
      class="size-20 shrink-0 rounded-lg bg-white p-1"
    >

    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <p class="text-xs font-medium text-cast-fog">
        Invite to this room
      </p>
      <p class="truncate text-[11px] text-cast-mist">
        {{ roomUrl }}
      </p>
      <Button
        size="sm"
        class="self-start"
        @click="copyLink"
      >
        {{ copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy failed' : 'Copy link' }}
      </Button>
    </div>
  </div>
</template>
