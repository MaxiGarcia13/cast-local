<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppModeTabs from '@/components/app-mode-tabs.vue';
import AppNavHeader from '@/components/app-nav-header.vue';
import Button from '@/components/button.vue';
import FilePicker from '@/components/file-picker.vue';
import CubeSendIcon from '@/components/icons/cube-send.vue';
import TextComposer from '@/components/text-composer.vue';
import { usePasteSharePayload } from '@/composables/use-paste-share-payload';
import { setSharePayload } from '@/stores/share-payload';
import { createRoomId, roomHostPath } from '@/utils/room-id';

const router = useRouter();
const files = ref<File[]>([]);
const text = ref('');

const { pasteFromClipboard, pasteLabel } = usePasteSharePayload(files, text);

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
  >
    <AppNavHeader />
    <AppModeTabs />

    <main class="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8">
      <p class="text-center text-base text-cast-mist md:text-lg">
        Drop files or text. Share a room link. Send over the air.
      </p>

      <Button
        variant="secondary"
        size="sm"
        tone="neutral"
        class="self-end -mb-4"
        @click="pasteFromClipboard"
      >
        {{ pasteLabel('Paste from clipboard') }}
      </Button>

      <FilePicker v-model="files" />
      <TextComposer v-model="text" />

      <Button
        size="lg"
        class="self-center"
        :disabled="!canShare"
        @click="startShare"
      >
        <CubeSendIcon class="size-6" />
        Share
      </Button>
    </main>
  </div>
</template>
