<script setup lang="ts">
import { RouterLink } from 'vue-router';
import ProfileAvatarButton from '@/components/profile/profile-avatar-button.vue';
</script>

<template>
  <nav
    class="mb-12 flex w-full items-center justify-between border-b border-cast-mist/20 pb-4"
    aria-label="Main"
  >
    <div class="flex items-center gap-6 text-sm text-cast-mist">
      <RouterLink
        v-slot="{ href, navigate, isExactActive }"
        to="/"
        custom
      >
        <a
          :href="href"
          class="transition hover:text-cast-fog"
          :class="{ 'text-cast-fog': isExactActive }"
          @click="navigate"
        >
          create a room
        </a>
      </RouterLink>
      <RouterLink
        v-slot="{ href, navigate, isExactActive }"
        to="/join"
        custom
      >
        <a
          :href="href"
          class="transition hover:text-cast-fog"
          :class="{ 'text-cast-fog': isExactActive }"
          @click="navigate"
        >
          join a room
        </a>
      </RouterLink>
    </div>

    <ProfileAvatarButton size-class="size-10" />
  </nav>
</template>
