<script setup lang="ts">
import AppModeTabs from '@/components/app-mode-tabs.vue';
import AppNavHeader from '@/components/app-nav-header.vue';
import JoinRoomForm from '@/components/join-room-form.vue';
</script>

<template>
  <AppNavHeader />
  <AppModeTabs />

  <main class="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8">
    <p class="text-center text-base text-cast-mist md:text-lg">
      Enter a room code to connect with the host.
    </p>

    <JoinRoomForm />
  </main>
</template>
