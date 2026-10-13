<script setup lang="ts">
import BrandIcon from '@/components/icons/brand.vue';
import ProfileAvatarButton from '@/components/profile/profile-avatar-button.vue';

withDefaults(defineProps<{
  brandSizeClass?: string;
  spacingClass?: string;
}>(), {
  brandSizeClass: 'size-12',
  spacingClass: 'mb-12',
});
</script>

<template>
  <header
    class="flex flex-col items-center gap-4 text-center"
    :class="spacingClass"
  >
    <div class="relative flex w-full items-start justify-center">
      <div class="flex flex-col items-center gap-4">
        <BrandIcon
          class="text-cast-signal"
          :class="brandSizeClass"
        />
        <slot name="title" />
      </div>

      <div class="absolute right-0 top-0">
        <ProfileAvatarButton size-class="size-12" />
      </div>
    </div>

    <slot />
  </header>
</template>
