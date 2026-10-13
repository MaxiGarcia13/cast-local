<script setup lang="ts">
import { computed } from 'vue';
import { getAvatarComponent } from '@/domain/profile/avatar-catalog';
import { getUserColorHex } from '@/domain/profile/user-colors';

const props = withDefaults(defineProps<{
  avatarId: string;
  colorId: string;
  sizeClass?: string;
}>(), {
  sizeClass: 'size-12',
});

const colorHex = computed(() => getUserColorHex(props.colorId));
const AvatarIcon = computed(() => getAvatarComponent(props.avatarId));
</script>

<template>
  <span
    class="relative inline-block shrink-0 overflow-hidden rounded-full border-2 bg-cast-panel"
    :class="sizeClass"
    :style="{
      borderColor: colorHex,
      boxShadow: `0 0 24px ${colorHex}73`,
    }"
  >
    <component
      :is="AvatarIcon"
      v-if="AvatarIcon"
      class="pointer-events-none absolute inset-0 size-full max-h-none max-w-none"
    />
  </span>
</template>
