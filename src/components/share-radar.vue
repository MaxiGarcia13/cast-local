<script setup lang="ts">
import type { PeerInfo } from '@/domain/p2p';
import PeerDot from '@/components/peer-dot.vue';

const props = defineProps<{
  peers: PeerInfo[];
  selfName: string;
}>();

defineEmits<{
  select: [peer: PeerInfo];
}>();

function peerAngle(index: number): number {
  if (props.peers.length === 0) {
    return 0;
  }
  return (360 / props.peers.length) * index - 90;
}
</script>

<template>
  <div class="relative mx-auto aspect-square w-full max-w-md">
    <div
      class="pointer-events-none absolute inset-8 rounded-full border border-cast-mist/20"
      style="animation: cast-pulse-ring 3s ease-out infinite"
    />
    <div
      class="pointer-events-none absolute inset-16 rounded-full border border-cast-mist/25"
      style="animation: cast-pulse-ring 3s ease-out 0.6s infinite"
    />
    <div
      class="pointer-events-none absolute inset-24 rounded-full border border-cast-signal/20"
      style="animation: cast-pulse-ring 3s ease-out 1.2s infinite"
    />

    <div class="absolute inset-0">
      <PeerDot
        v-for="(peer, index) in peers"
        :key="peer.id"
        :peer="peer"
        :angle="peerAngle(index)"
        :radius="132"
        @select="$emit('select', $event)"
      />
    </div>

    <div class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
      <span class="size-16 rounded-full bg-cast-coral shadow-[0_0_28px_rgb(255_154_60_/_0.4)]" />
      <span class="text-sm font-semibold text-cast-fog">
        {{ selfName }}
      </span>
      <span class="text-xs text-cast-mist">
        You
      </span>
    </div>

    <p
      v-if="peers.length === 0"
      class="absolute inset-x-0 bottom-0 text-center text-sm text-cast-mist"
    >
      Looking for devices nearby…
    </p>
  </div>
</template>
