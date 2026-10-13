<script setup lang="ts">
import type { PeerInfo } from '@roomcast/shared';
import ShareRadar from '@/components/share-radar.vue';

defineProps<{
  hasPayload: boolean;
  peers: PeerInfo[];
  radarDisabled: boolean;
}>();

defineEmits<{
  select: [peer: PeerInfo];
}>();
</script>

<template>
  <div class="flex w-full flex-col items-center gap-6">
    <p
      v-if="!hasPayload"
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
      :peers="peers"
      :disabled="radarDisabled"
      @select="$emit('select', $event)"
    />
  </div>
</template>
