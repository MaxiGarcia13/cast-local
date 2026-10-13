<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import FilePicker from '@/components/file-picker.vue';
import BrandIcon from '@/components/icons/brand.vue';
import CubeSendIcon from '@/components/icons/cube-send.vue';
import TextComposer from '@/components/text-composer.vue';
import { setSharePayload } from '@/stores/share-payload';
import { createRoomId, roomHostPath } from '@/utils/room-id';

const router = useRouter();
const files = ref<File[]>([]);
const text = ref('');

const canShare = computed(() => {
  return files.value.length > 0 || text.value.trim().length > 0;
});

function startShare() {
  if (!canShare.value) {
    return;
  }

  setSharePayload(files.value, text.value);
  void router.push(roomHostPath(createRoomId()));
}
</script>

<template>
  <div
    class="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6 py-12"
    style="animation: cast-fade-up 0.6s ease-out both"
  >
    <header class="mb-12 flex flex-col items-center gap-4 text-center">
      <BrandIcon class="size-12 text-cast-signal" />
      <p class="font-display text-5xl font-extrabold tracking-tight text-cast-fog md:text-6xl">
        Roomcast
      </p>
      <p class="text-base text-cast-mist md:text-lg">
        Drop files or text. Share a room link. Send over the air.
      </p>
    </header>

    <main class="flex flex-1 flex-col items-center gap-8">
      <FilePicker v-model="files" />
      <TextComposer v-model="text" />

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-xl bg-cast-signal px-8 py-4 font-display text-lg font-bold text-cast-ink transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!canShare"
        @click="startShare"
      >
        <CubeSendIcon class="size-6" />
        Share
      </button>
    </main>
  </div>
</template>
