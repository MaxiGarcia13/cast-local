<script setup lang="ts">
import BrandIcon from '@/components/icons/brand.vue';

defineProps<{
  roomId: string;
  statusLabel: string;
  isError: boolean;
}>();
</script>

<template>
  <header class="mb-8 flex flex-col items-center gap-4 text-center">
    <BrandIcon class="size-10 text-cast-signal" />
    <p class="font-display text-3xl font-extrabold tracking-tight text-cast-fog md:text-4xl">
      Room {{ roomId }}
    </p>
    <p
      class="text-xs"
      :class="isError ? 'text-cast-coral' : 'text-cast-mist'"
    >
      {{ statusLabel }}
    </p>
  </header>
</template>
