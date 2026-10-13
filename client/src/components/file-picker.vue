<script setup lang="ts">
import { ref } from 'vue';
import UploadIcon from '@/components/icons/upload.vue';
import { formatBytes } from '@/utils/format-bytes';
import { snapshotFiles } from '@/utils/snapshot-file';

const files = defineModel<File[]>({ default: () => [] });
const isLoading = ref(false);

async function addFiles(selected: File[]) {
  if (selected.length === 0) {
    return;
  }

  isLoading.value = true;
  try {
    const snapshots = await snapshotFiles(selected);
    files.value = [...files.value, ...snapshots];
  } finally {
    isLoading.value = false;
  }
}

async function onFileInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const selected = input.files ? [...input.files] : [];
  // Snapshot before clearing the input so Chromium keeps the bytes readable.
  await addFiles(selected);
  input.value = '';
}

function removeFile(index: number) {
  files.value = files.value.filter((_, fileIndex) => fileIndex !== index);
}

async function onDrop(event: DragEvent) {
  event.preventDefault();
  const dropped = event.dataTransfer?.files;
  if (!dropped?.length) {
    return;
  }
  await addFiles([...dropped]);
}
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-4">
    <label
      class="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-cast-mist/40 bg-cast-panel/40 px-6 py-12 text-center transition hover:border-cast-signal/60 hover:bg-cast-panel/70"
      :class="{ 'pointer-events-none opacity-60': isLoading }"
      @dragover.prevent
      @drop="onDrop"
    >
      <UploadIcon class="size-8 text-cast-mist" />
      <span class="font-display text-xl font-semibold text-cast-fog">
        {{ isLoading ? 'Preparing files…' : 'Choose files' }}
      </span>
      <span class="text-sm text-cast-mist">
        Drop them here or click to browse
      </span>
      <input
        type="file"
        class="sr-only"
        multiple
        :disabled="isLoading"
        @change="onFileInput"
      >
    </label>

    <ul
      v-if="files.length"
      class="flex flex-col gap-2"
    >
      <li
        v-for="(file, index) in files"
        :key="`${file.name}-${file.size}-${file.lastModified}-${index}`"
        class="flex items-center justify-between gap-4 rounded-xl bg-cast-panel/60 px-4 py-2"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-cast-fog">
            {{ file.name }}
          </p>
          <p class="text-xs text-cast-mist">
            {{ formatBytes(file.size) }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-xl px-2 py-2 text-sm text-cast-mist transition hover:text-cast-coral"
          aria-label="Remove file"
          @click="removeFile(index)"
        >
          Remove
        </button>
      </li>
    </ul>
  </div>
</template>
