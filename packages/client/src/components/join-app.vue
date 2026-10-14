<script setup lang="ts">
import AppBrandHeader from '@/components/app-brand-header.vue';
import AppModeTabs from '@/components/app-mode-tabs.vue';
import AppNavHeader from '@/components/app-nav-header.vue';
import JoinRoomForm from '@/components/join-room-form.vue';
</script>

<template>
  <div
    class="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6 py-12"
  >
    <AppNavHeader />

    <div class="mx-auto flex w-full max-w-lg flex-1 flex-col">
      <AppModeTabs />

      <AppBrandHeader
        :show-avatar="false"
        :show-brand="false"
      >
        <p class="text-base text-cast-mist md:text-lg">
          Enter a room code to connect with the host.
        </p>
      </AppBrandHeader>

      <main class="flex flex-1 flex-col gap-8">
        <JoinRoomForm />
      </main>
    </div>
  </div>
</template>
