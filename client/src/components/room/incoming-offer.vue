<script setup lang="ts">
import type { FileMeta } from '@roomcast/shared';
import { computed } from 'vue';
import Button from '@/components/button.vue';
import { formatBytes } from '@/utils/format-bytes';

const props = defineProps<{
  peerName: string;
  files: FileMeta[];
  textPreview: string | null;
}>();

defineEmits<{
  accept: [];
  decline: [];
}>();

const summary = computed(() => {
  const parts: string[] = [];
  if (props.textPreview) {
    parts.push('text');
  }
  if (props.files.length === 1) {
    parts.push('1 file');
  } else if (props.files.length > 1) {
    parts.push(`${props.files.length} files`);
  }
  return parts.join(' and ') || 'a transfer';
});
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-cast-ink/80 px-6">
    <div class="w-full max-w-md rounded-xl bg-cast-panel p-6 shadow-xl">
      <p class="font-display text-xl font-bold text-cast-fog">
        Incoming transfer
      </p>
      <p class="mt-2 text-sm text-cast-mist">
        {{ peerName }} wants to send {{ summary }}
      </p>

      <div
        v-if="textPreview"
        class="mt-4 rounded-xl bg-cast-ink/40 px-4 py-4"
      >
        <p class="text-xs font-medium uppercase tracking-wide text-cast-mist">
          Text
        </p>
        <p class="mt-2 whitespace-pre-wrap wrap-break-word text-sm text-cast-fog">
          {{ textPreview }}
        </p>
      </div>

      <ul
        v-if="files.length"
        class="mt-4 flex max-h-48 flex-col gap-2 overflow-y-auto"
      >
        <li
          v-for="file in files"
          :key="file.id"
          class="rounded-xl bg-cast-ink/40 px-4 py-2 text-sm"
        >
          <p class="truncate font-medium text-cast-fog">
            {{ file.name }}
          </p>
          <p class="text-xs text-cast-mist">
            {{ formatBytes(file.size) }}
          </p>
        </li>
      </ul>

      <div class="mt-6 flex gap-4">
        <Button
          class="flex-1"
          @click="$emit('accept')"
        >
          Accept
        </Button>
        <Button
          variant="secondary"
          class="flex-1"
          @click="$emit('decline')"
        >
          Decline
        </Button>
      </div>
    </div>
  </div>
</template>
