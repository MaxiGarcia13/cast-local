<script setup lang="ts">
import type { PeerInfo } from '@/domain/p2p';

withDefaults(defineProps<{
  peer: PeerInfo;
  angle: number;
  radius: number;
  disabled?: boolean;
  pulseDelay?: string;
}>(), {
  disabled: false,
  pulseDelay: '0s',
});

defineEmits<{
  select: [peer: PeerInfo];
}>();
</script>

<template>
  <button
    type="button"
    class="absolute left-1/2 top-1/2 flex flex-col items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
    :style="{
      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`,
    }"
    :disabled="disabled"
    :aria-label="`Share with ${peer.name}`"
    @click="$emit('select', peer)"
  >
    <span
      class="size-12 rounded-full bg-cast-signal/90 shadow-[0_0_24px_rgb(255_122_26_/_0.45)] transition hover:scale-110"
      :style="{ animation: `cast-peer-pulse 2.8s ease-in-out ${pulseDelay} infinite` }"
    />
    <span class="max-w-24 truncate text-center text-xs font-medium text-cast-fog">
      {{ peer.name }}
    </span>
  </button>
</template>
