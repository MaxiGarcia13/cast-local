<script setup lang="ts">
import { RouterLink } from 'vue-router';
import BrandIcon from '@/components/icons/brand.vue';
import ProfileAvatarButton from '@/components/profile/profile-avatar-button.vue';
</script>

<template>
  <nav
    class="mb-12 flex w-full items-center justify-between gap-4 border-b border-cast-mist/20 pb-4"
    aria-label="Main"
  >
    <div class="flex min-w-0 items-center gap-6">
      <RouterLink
        to="/"
        class="flex shrink-0 items-center gap-2 text-cast-fog transition hover:text-cast-signal"
      >
        <BrandIcon class="size-8 text-cast-signal" />
        <span class="font-display text-lg font-extrabold tracking-tight">
          Roomcast
        </span>
      </RouterLink>

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
    </div>

    <ProfileAvatarButton size-class="size-10" />
  </nav>
</template>
