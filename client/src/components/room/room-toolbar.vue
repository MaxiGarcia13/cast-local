<script setup lang="ts">
import Button from '@/components/button.vue';
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
    <Button
      variant="ghost"
      tone="neutral"
      @click="$emit('leave')"
    >
      <ChevronLeftIcon class="size-4" />
      Leave
    </Button>
    <p class="text-sm text-cast-mist">
      {{ readySummary }}
    </p>
  </div>
</template>
