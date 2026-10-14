<script setup lang="ts">
import BrandIcon from '@/components/icons/brand.vue';
import ProfileAvatarButton from '@/components/profile/profile-avatar-button.vue';

withDefaults(defineProps<{
  brandSizeClass?: string;
  spacingClass?: string;
  showAvatar?: boolean;
  showBrand?: boolean;
}>(), {
  brandSizeClass: 'size-12',
  spacingClass: 'mb-12',
  showAvatar: true,
  showBrand: true,
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
          v-if="showBrand"
          class="text-cast-signal"
          :class="brandSizeClass"
        />
        <slot name="title" />
      </div>

      <div
        v-if="showAvatar"
        class="absolute right-0 top-0"
      >
        <ProfileAvatarButton size-class="size-12" />
      </div>
    </div>

    <slot />
  </header>
</template>
