<script setup lang="ts">
import { RouterLink } from 'vue-router';
import BrandIcon from '@/components/icons/brand.vue';
import ProfileAvatarButton from '@/components/profile/profile-avatar-button.vue';
</script>

<template>
  <header
    class="mb-6 flex w-full items-center justify-between gap-4"
  >
    <RouterLink
      to="/"
      class="flex shrink-0 items-center gap-2 text-cast-fog transition hover:text-cast-signal"
    >
      <BrandIcon class="size-8 text-cast-signal" />
      <span class="font-display text-lg font-extrabold tracking-tight">
        Roomcast
      </span>
    </RouterLink>

    <ProfileAvatarButton size-class="size-10" />
  </header>
</template>
