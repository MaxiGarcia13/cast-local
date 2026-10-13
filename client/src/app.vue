<script setup lang="ts">
import { provide, useTemplateRef } from 'vue';
import UserProfileDialog from '@/components/profile/user-profile-dialog.vue';
import { OPEN_PROFILE_DIALOG_KEY } from '@/composables/open-profile-dialog';

const profileDialog = useTemplateRef<{ showModal: () => void }>('profileDialog');

provide(OPEN_PROFILE_DIALOG_KEY, () => {
  profileDialog.value?.showModal();
});
</script>

<template>
  <RouterView />
  <UserProfileDialog ref="profileDialog" />
</template>
