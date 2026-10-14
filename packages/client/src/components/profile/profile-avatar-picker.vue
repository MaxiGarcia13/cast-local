<script setup lang="ts">
import { AVATAR_IDS, getAvatarComponent } from '@/domain/profile/avatar-catalog';

const avatarId = defineModel<string>({ required: true });
</script>

<template>
  <fieldset class="flex flex-col gap-2">
    <legend class="text-sm font-medium text-cast-mist">
      Avatar
    </legend>
    <div class="grid max-h-64 grid-cols-5 gap-2 overflow-y-auto sm:grid-cols-6">
      <button
        v-for="id in AVATAR_IDS"
        :key="id"
        type="button"
        class="relative aspect-square w-full min-h-0 min-w-0 cursor-pointer overflow-hidden rounded-xl border-2 bg-cast-ink/40 transition hover:scale-105"
        :class="avatarId === id ? 'border-cast-signal' : 'border-transparent'"
        :aria-label="id"
        :aria-pressed="avatarId === id"
        @click="avatarId = id"
      >
        <component
          :is="getAvatarComponent(id)"
          class="pointer-events-none absolute inset-0 size-full max-h-none max-w-none"
        />
      </button>
    </div>
    <p class="text-xs text-cast-mist">
      Avatars from
      <a
        href="https://openpeeps.com/"
        target="_blank"
        rel="noopener noreferrer"
        class="underline transition hover:text-cast-fog"
      >Open Peeps</a>
      (CC0).
    </p>
  </fieldset>
</template>
