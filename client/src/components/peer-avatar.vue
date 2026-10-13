<script setup lang="ts">
import { computed } from 'vue';
import { getAvatarUrl } from '@/domain/profile/avatar-catalog';
import { getUserColorHex } from '@/domain/profile/user-colors';

const props = withDefaults(defineProps<{
  avatarId: string;
  colorId: string;
  sizeClass?: string;
}>(), {
  sizeClass: 'size-12',
});

const colorHex = computed(() => getUserColorHex(props.colorId));
const avatarUrl = computed(() => getAvatarUrl(props.avatarId));
</script>

<template>
  <span
    class="inline-flex shrink-0 overflow-hidden rounded-full border-2 bg-cast-panel"
    :class="sizeClass"
    :style="{
      borderColor: colorHex,
      boxShadow: `0 0 24px ${colorHex}73`,
    }"
  >
    <img
      v-if="avatarUrl"
      :src="avatarUrl"
      alt=""
      class="size-full object-cover object-top"
      draggable="false"
    >
  </span>
</template>
