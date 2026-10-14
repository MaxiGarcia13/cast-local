<script setup lang="ts">
import { RouterLink } from 'vue-router';

const tabClass = [
  'relative flex-1 rounded-xl px-4 py-2 text-center text-sm transition',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cast-signal/60',
].join(' ');
const idleClass = 'text-cast-mist hover:text-cast-fog';
const activeClass = 'bg-cast-ink/80 font-semibold text-cast-fog shadow-sm';
</script>

<template>
  <nav
    class="mb-8 flex w-full items-center gap-1 rounded-xl border border-cast-mist/20 bg-cast-panel/60 p-1"
    aria-label="App mode"
  >
    <RouterLink
      v-slot="{ href, navigate, isExactActive }"
      to="/"
      custom
    >
      <a
        :href="href"
        :class="[tabClass, isExactActive ? activeClass : idleClass]"
        :aria-current="isExactActive ? 'page' : undefined"
        @click="navigate"
      >
        Upload files
      </a>
    </RouterLink>
    <RouterLink
      v-slot="{ href, navigate, isExactActive }"
      to="/join"
      custom
    >
      <a
        :href="href"
        :class="[tabClass, isExactActive ? activeClass : idleClass]"
        :aria-current="isExactActive ? 'page' : undefined"
        @click="navigate"
      >
        Join room
      </a>
    </RouterLink>
  </nav>
</template>
