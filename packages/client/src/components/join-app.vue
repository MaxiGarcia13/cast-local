<script setup lang="ts">
import AppBrandHeader from '@/components/app-brand-header.vue';
import AppNavHeader from '@/components/app-nav-header.vue';
</script>

<template>
  <div
    class="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6 py-12"
    style="animation: cast-fade-up 0.6s ease-out both"
  >
    <AppNavHeader />

    <AppBrandHeader :show-avatar="false">
      <template #title>
        <p class="font-display text-5xl font-extrabold tracking-tight text-cast-fog md:text-6xl">
          Join a room
        </p>
      </template>
      <p class="text-base text-cast-mist md:text-lg">
        Enter a room code to connect with the host.
      </p>
    </AppBrandHeader>
  </div>
</template>
