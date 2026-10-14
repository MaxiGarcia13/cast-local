<script setup lang="ts">
defineProps<{
  roomId: string;
  statusLabel: string;
  isError: boolean;
}>();
</script>

<template>
  <div class="mb-8 text-center">
    <p class="font-display text-3xl font-extrabold tracking-tight text-cast-fog md:text-4xl">
      Room {{ roomId }}
    </p>
    <p
      class="mt-2 text-xs"
      :class="isError ? 'text-cast-coral' : 'text-cast-mist'"
    >
      {{ statusLabel }}
    </p>
  </div>
</template>
