<script setup lang="ts">
import type { PeerInfo } from '@roomcast/shared';
import { useStore } from '@nanostores/vue';
import PeerDot from '@/components/peer-dot.vue';
import ProfileAvatarButton from '@/components/profile/profile-avatar-button.vue';
import { userProfileStore } from '@/stores/user-profile';

const props = withDefaults(defineProps<{
  peers: PeerInfo[];
  disabled?: boolean;
}>(), {
  disabled: false,
});

defineEmits<{
  select: [peer: PeerInfo];
}>();

const profile = useStore(userProfileStore);

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

    <div
      class="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] origin-center rounded-full"
      style="
        background: conic-gradient(from 0deg, transparent 0deg, rgb(255 122 26 / 0.18) 40deg, transparent 80deg);
        animation: cast-sweep 4s linear infinite;
      "
    />

    <div class="absolute left-1/2 top-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
      <ProfileAvatarButton size-class="size-10" />
      <span class="text-sm font-semibold text-cast-fog">
        {{ profile.name }}
      </span>
      <span class="text-xs text-cast-mist">
        You
      </span>
    </div>

    <div class="absolute inset-0 z-10">
      <PeerDot
        v-for="(peer, index) in peers"
        :key="peer.id"
        :peer="peer"
        :angle="peerAngle(index)"
        :radius="132"
        :disabled="disabled"
        :pulse-delay="`${index * 0.2}s`"
        @select="$emit('select', $event)"
      />
    </div>

    <p
      v-if="peers.length === 0"
      class="absolute inset-x-0 bottom-0 text-center text-sm text-cast-mist"
    >
      Looking for devices nearby…
    </p>
  </div>
</template>
