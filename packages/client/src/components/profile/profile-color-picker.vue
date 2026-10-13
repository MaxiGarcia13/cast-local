<script setup lang="ts">
import { USER_COLORS } from '@/domain/profile/user-colors';

const colorId = defineModel<string>({ required: true });
</script>

<template>
  <fieldset class="flex flex-col gap-2">
    <legend class="text-sm font-medium text-cast-mist">
      Color
    </legend>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="color in USER_COLORS"
        :key="color.id"
        type="button"
        class="size-10 rounded-full border-2 transition hover:scale-110"
        :class="colorId === color.id ? 'border-cast-fog' : 'border-transparent'"
        :style="{ backgroundColor: color.hex }"
        :aria-label="color.label"
        :aria-pressed="colorId === color.id"
        @click="colorId = color.id"
      />
    </div>
  </fieldset>
</template>
