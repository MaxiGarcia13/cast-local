<script setup lang="ts">
import { useTemplateRef } from 'vue';

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog');

function showModal() {
  dialogRef.value?.showModal();
}

function close() {
  dialogRef.value?.close();
}

defineExpose({
  showModal,
  close,
});
</script>

<template>
  <dialog
    ref="dialog"
    class="m-auto max-h-[90dvh] overflow-y-auto rounded-xl border border-cast-mist/20 bg-cast-panel p-6 text-cast-fog shadow-lg backdrop:bg-cast-ink/80 backdrop:backdrop-blur-sm"
  >
    <header
      v-if="$slots.header"
      class="mb-4 text-lg font-medium"
    >
      <slot name="header" />
    </header>
    <slot />
    <footer
      v-if="$slots.footer"
      class="mt-6 flex justify-end gap-2"
    >
      <slot name="footer" />
    </footer>
  </dialog>
</template>
