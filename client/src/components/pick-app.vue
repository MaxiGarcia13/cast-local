<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppBrandHeader from '@/components/app-brand-header.vue';
import Button from '@/components/button.vue';
import FilePicker from '@/components/file-picker.vue';
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
    <AppBrandHeader>
      <template #title>
        <p class="font-display text-5xl font-extrabold tracking-tight text-cast-fog md:text-6xl">
          Roomcast
        </p>
      </template>
      <p class="text-base text-cast-mist md:text-lg">
        Drop files or text. Share a room link. Send over the air.
      </p>
    </AppBrandHeader>

    <main class="flex flex-1 flex-col items-center gap-8">
      <FilePicker v-model="files" />
      <TextComposer v-model="text" />

      <Button
        size="lg"
        :disabled="!canShare"
        @click="startShare"
      >
        <CubeSendIcon class="size-6" />
        Share
      </Button>
    </main>
  </div>
</template>
