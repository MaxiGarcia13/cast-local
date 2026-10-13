<script setup lang="ts">
const text = defineModel<string>({ default: '' });
</script>

<template>
  <div class="flex w-full max-w-lg flex-col gap-2">
    <label
      for="cast-text"
      class="text-sm font-medium text-cast-mist"
    >
      Or share text
    </label>
    <textarea
      id="cast-text"
      v-model="text"
      rows="4"
      placeholder="Paste a link, note, or message…"
      class="w-full resize-y rounded-xl border border-cast-mist/30 bg-cast-panel/60 px-4 py-4 text-sm text-cast-fog outline-none transition placeholder:text-cast-mist/60 focus:border-cast-signal"
    />
  </div>
</template>
