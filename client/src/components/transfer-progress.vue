<script setup lang="ts">
import type { TransferProgress } from '@/composables/use-file-transfer';
import { computed } from 'vue';
import Button from '@/components/button.vue';
import { useCopyToClipboard } from '@/composables/use-copy-to-clipboard';
import { formatBytes } from '@/utils/format-bytes';

const props = defineProps<{
  progress: TransferProgress;
}>();

defineEmits<{
  dismiss: [];
}>();

const { copy, label: copyLabel } = useCopyToClipboard();

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
      if (props.progress.receivedText && props.progress.filesTotal === 0) {
        return 'Text received';
      }
      return props.progress.filesTotal > 1 ? 'All files complete' : 'Complete';
    case 'error':
      return 'Transfer failed';
    default:
      return 'Ready';
  }
});

const canDismiss = computed(() =>
  props.progress.phase === 'complete' || props.progress.phase === 'error',
);

function copyText() {
  if (!props.progress.receivedText) {
    return;
  }
  void copy(props.progress.receivedText);
}
</script>

<template>
  <div
    v-if="progress.phase !== 'idle'"
    class="w-full max-w-md rounded-xl bg-cast-panel/80 px-4 py-4"
    style="animation: cast-fade-up 0.35s ease-out both"
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
        class="h-full rounded-full transition-[width] duration-200"
        :class="progress.phase === 'error' ? 'bg-cast-coral' : 'bg-cast-signal'"
        :style="{ width: `${percent}%` }"
      />
    </div>

    <p
      v-if="progress.filesTotal > 0"
      class="mt-2 text-xs text-cast-mist"
    >
      File {{ Math.min(progress.filesDone + (progress.currentFileName ? 1 : 0), progress.filesTotal) }}
      of {{ progress.filesTotal }}
      <template v-if="progress.currentFileName">
        · {{ progress.currentFileName }}
      </template>
    </p>

    <p
      v-else-if="progress.currentFileName"
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

    <div
      v-if="progress.receivedText"
      class="mt-4 rounded-xl bg-cast-ink/50 px-4 py-4"
    >
      <p class="whitespace-pre-wrap wrap-break-word text-sm text-cast-fog">
        {{ progress.receivedText }}
      </p>
      <Button
        class="mt-4"
        @click="copyText"
      >
        {{ copyLabel('Copy text') }}
      </Button>
    </div>

    <ul
      v-if="progress.completedFiles.length"
      class="mt-4 flex max-h-32 flex-col gap-2 overflow-y-auto"
    >
      <li
        v-for="fileName in progress.completedFiles"
        :key="fileName"
        class="truncate rounded-xl bg-cast-ink/50 px-4 py-2 text-xs text-cast-fog"
      >
        {{ fileName }}
        <span class="text-cast-signal"> saved</span>
      </li>
    </ul>

    <p
      v-if="progress.error"
      class="mt-4 text-sm text-cast-coral"
    >
      {{ progress.error }}
    </p>

    <Button
      v-if="canDismiss"
      variant="secondary"
      tone="neutral"
      class="mt-4 w-full"
      @click="$emit('dismiss')"
    >
      {{ progress.phase === 'error' ? 'Dismiss' : 'Done' }}
    </Button>
  </div>
</template>
