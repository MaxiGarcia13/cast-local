<script setup lang="ts">
import AppBrandHeader from '@/components/app-brand-header.vue';

defineProps<{
  roomId: string;
  statusLabel: string;
  isError: boolean;
}>();
</script>

<template>
  <AppBrandHeader
    brand-size-class="size-10"
    spacing-class="mb-8"
  >
    <template #title>
      <p class="font-display text-3xl font-extrabold tracking-tight text-cast-fog md:text-4xl">
        Room {{ roomId }}
      </p>
    </template>
    <p
      class="text-xs"
      :class="isError ? 'text-cast-coral' : 'text-cast-mist'"
    >
      {{ statusLabel }}
    </p>
  </AppBrandHeader>
</template>
