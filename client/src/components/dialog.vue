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
    class="bg-background m-auto rounded-xl p-6 shadow-lg backdrop:bg-black/40 backdrop:backdrop-blur-sm"
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
