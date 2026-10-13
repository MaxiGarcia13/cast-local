<script setup lang="ts">
import { AVATAR_IDS, getAvatarComponent } from '@/domain/profile/avatar-catalog';

const avatarId = defineModel<string>({ required: true });
</script>

<template>
  <fieldset class="flex flex-col gap-2">
    <legend class="text-sm font-medium text-cast-mist">
      Avatar
    </legend>
    <div class="grid max-h-64 grid-cols-5 gap-2 overflow-y-auto pr-2 sm:grid-cols-6">
      <button
        v-for="id in AVATAR_IDS"
        :key="id"
        type="button"
        class="aspect-square overflow-hidden rounded-xl border-2 bg-cast-ink/40 transition hover:scale-105"
        :class="avatarId === id ? 'border-cast-signal' : 'border-transparent'"
        :aria-label="id"
        :aria-pressed="avatarId === id"
        @click="avatarId = id"
      >
        <component
          :is="getAvatarComponent(id)"
          class="size-full"
        />
      </button>
    </div>
  </fieldset>
</template>
