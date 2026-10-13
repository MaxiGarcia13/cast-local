<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import ProfileAvatarButton from '@/components/profile/profile-avatar-button.vue';
import { userProfileStore } from '@/stores/user-profile';

const profile = useStore(userProfileStore);
</script>

<template>
  <div class="flex w-full max-w-md flex-col items-center gap-6 rounded-xl bg-cast-panel/80 px-6 py-10 text-center">
    <div class="flex flex-col items-center gap-2">
      <ProfileAvatarButton size-class="size-16" />
      <span class="text-sm font-semibold text-cast-fog">
        {{ profile.name }}
      </span>
      <span class="text-xs text-cast-mist">
        Tap avatar to edit
      </span>
    </div>

    <div class="flex flex-col gap-2">
      <p class="font-display text-xl font-bold text-cast-fog">
        You are in the room
      </p>
      <p class="text-sm text-cast-mist">
        Stay on this page. When someone sends files or text, you will get an accept prompt.
      </p>
    </div>
  </div>
</template>
