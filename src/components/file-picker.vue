<script setup lang="ts">
import UploadIcon from '@/components/icons/upload.vue';
import { formatBytes } from '@/utils/format-bytes';

const files = defineModel<File[]>({ default: () => [] });

function onFileInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const selected = input.files ? [...input.files] : [];
  if (selected.length === 0) {
    return;
  }
  files.value = [...files.value, ...selected];
  input.value = '';
}

function removeFile(index: number) {
  files.value = files.value.filter((_, fileIndex) => fileIndex !== index);
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  const dropped = event.dataTransfer?.files;
  if (!dropped?.length) {
    return;
  }
  files.value = [...files.value, ...dropped];
}
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-4">
    <label
      class="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-cast-mist/40 bg-cast-panel/40 px-6 py-12 text-center transition hover:border-cast-signal/60 hover:bg-cast-panel/70"
      @dragover.prevent
      @drop="onDrop"
    >
      <UploadIcon class="size-8 text-cast-mist" />
      <span class="font-display text-xl font-semibold text-cast-fog">
        Choose files
      </span>
      <span class="text-sm text-cast-mist">
        Drop them here or click to browse
      </span>
      <input
        type="file"
        class="sr-only"
        multiple
        @change="onFileInput"
      >
    </label>

    <ul
      v-if="files.length"
      class="flex flex-col gap-2"
    >
      <li
        v-for="(file, index) in files"
        :key="`${file.name}-${file.size}-${index}`"
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
