<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import RoomApp from '@/components/room/room-app.vue';

const route = useRoute();
const roomId = computed(() => String(route.params.id ?? ''));
const roomRole = computed(() => (route.name === 'room-host' ? 'host' : 'guest'));
</script>

<template>
  <RoomApp :room-id="roomId" :room-role="roomRole" />
</template>
