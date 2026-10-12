<script setup lang="ts">
import ChevronLeftIcon from '@/components/icons/chevron-left.vue';

defineProps<{
  readySummary: string;
}>();

defineEmits<{
  leave: [];
}>();
</script>

<template>
  <div class="flex w-full max-w-md items-center justify-between gap-4">
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-cast-mist transition hover:text-cast-fog"
      @click="$emit('leave')"
    >
      <ChevronLeftIcon class="size-4" />
      Leave
    </button>
    <p class="text-sm text-cast-mist">
      {{ readySummary }}
    </p>
  </div>
</template>
