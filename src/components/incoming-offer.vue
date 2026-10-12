<script setup lang="ts">
import type { FileMeta } from '@/domain/p2p';
import { formatBytes } from '@/utils/format-bytes';

defineProps<{
  peerName: string;
  files: FileMeta[];
}>();

defineEmits<{
  accept: [];
  decline: [];
}>();
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-cast-ink/80 px-6">
    <div class="w-full max-w-md rounded-xl bg-cast-panel p-6 shadow-xl">
      <p class="font-display text-xl font-bold text-cast-fog">
        Incoming transfer
      </p>
      <p class="mt-2 text-sm text-cast-mist">
        {{ peerName }} wants to send {{ files.length }} file{{ files.length === 1 ? '' : 's' }}
      </p>

      <ul class="mt-4 flex max-h-48 flex-col gap-2 overflow-y-auto">
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
        <button
          type="button"
          class="flex-1 rounded-xl bg-cast-signal px-4 py-2 font-semibold text-cast-ink transition hover:brightness-110"
          @click="$emit('accept')"
        >
          Accept
        </button>
        <button
          type="button"
          class="flex-1 rounded-xl border border-cast-mist/30 px-4 py-2 text-cast-fog transition hover:border-cast-coral hover:text-cast-coral"
          @click="$emit('decline')"
        >
          Decline
        </button>
      </div>
    </div>
  </div>
</template>
