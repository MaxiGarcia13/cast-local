<script setup lang="ts">
import { useStore } from '@nanostores/vue';
import PeerAvatar from '@/components/peer-avatar.vue';
import { useOpenProfileDialog } from '@/composables/open-profile-dialog';
import { userProfileStore } from '@/stores/user-profile';

withDefaults(defineProps<{
  sizeClass?: string;
}>(), {
  sizeClass: 'size-12',
});

const profile = useStore(userProfileStore);
const openProfileDialog = useOpenProfileDialog();
</script>

<template>
  <button
    type="button"
    class="rounded-full bg-transparent p-0 transition hover:scale-110 cursor-pointer"
    aria-label="Edit your profile"
    @click="openProfileDialog"
  >
    <PeerAvatar
      :avatar-id="profile.avatarId"
      :color-id="profile.colorId"
      :size-class="sizeClass"
    />
  </button>
</template>
