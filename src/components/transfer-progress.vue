<script setup lang="ts">
import type { TransferProgress } from '@/composables/use-file-transfer';
import { computed } from 'vue';
import { formatBytes } from '@/utils/format-bytes';

const props = defineProps<{
  progress: TransferProgress;
}>();

const percent = computed(() => {
  if (props.progress.bytesTotal <= 0) {
    return props.progress.phase === 'complete' ? 100 : 0;
  }
  return Math.min(100, Math.round((props.progress.bytesDone / props.progress.bytesTotal) * 100));
});

const label = computed(() => {
  switch (props.progress.phase) {
    case 'sending':
      return 'Sending';
    case 'receiving':
      return 'Receiving';
    case 'complete':
      return 'Complete';
    case 'error':
      return 'Failed';
    default:
      return 'Ready';
  }
});
</script>

<template>
  <div
    v-if="progress.phase !== 'idle'"
    class="w-full max-w-md rounded-xl bg-cast-panel/80 px-4 py-4"
  >
    <div class="flex items-center justify-between gap-4 text-sm">
      <p class="font-medium text-cast-fog">
        {{ label }}
      </p>
      <p class="text-cast-mist">
        {{ percent }}%
      </p>
    </div>

    <div class="mt-2 h-2 overflow-hidden rounded-full bg-cast-ink">
      <div
        class="h-full rounded-full bg-cast-signal transition-[width] duration-200"
        :style="{ width: `${percent}%` }"
      />
    </div>

    <p
      v-if="progress.currentFileName"
      class="mt-2 truncate text-xs text-cast-mist"
    >
      {{ progress.currentFileName }}
    </p>

    <p
      v-if="progress.bytesTotal > 0"
      class="mt-2 text-xs text-cast-mist"
    >
      {{ formatBytes(progress.bytesDone) }} / {{ formatBytes(progress.bytesTotal) }}
    </p>

    <p
      v-if="progress.error"
      class="mt-2 text-xs text-cast-coral"
    >
      {{ progress.error }}
    </p>
  </div>
</template>
