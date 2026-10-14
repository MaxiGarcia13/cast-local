<script setup lang="ts">
import type { UserProfile } from '@/stores/user-profile';
import { useStore } from '@nanostores/vue';
import { reactive, useTemplateRef, watch } from 'vue';
import Button from '@/components/button.vue';
import Dialog from '@/components/dialog.vue';
import ProfileAvatarPicker from '@/components/profile/profile-avatar-picker.vue';
import ProfileColorPicker from '@/components/profile/profile-color-picker.vue';
import {
  setUserProfile,

  userProfileStore,
} from '@/stores/user-profile';

const emit = defineEmits<{
  saved: [profile: UserProfile];
}>();

const profile = useStore(userProfileStore);
const dialogRef = useTemplateRef<{ showModal: () => void; close: () => void }>('dialog');

const draft = reactive({
  name: '',
  colorId: '',
  avatarId: '',
});

function syncDraftFromStore() {
  draft.name = profile.value.name;
  draft.colorId = profile.value.colorId;
  draft.avatarId = profile.value.avatarId;
}

function showModal() {
  syncDraftFromStore();
  dialogRef.value?.showModal();
}

function close() {
  dialogRef.value?.close();
}

function save() {
  const name = draft.name.trim();
  if (!name) {
    return;
  }

  setUserProfile({
    name,
    colorId: draft.colorId,
    avatarId: draft.avatarId,
  });
  emit('saved', userProfileStore.get());
  close();
}

watch(profile, syncDraftFromStore, { immediate: true });

defineExpose({
  showModal,
  close,
});
</script>

<template>
  <Dialog ref="dialog">
    <template #header>
      <span class="font-display font-bold text-cast-fog">Your profile</span>
    </template>

    <div class="flex w-full flex-col gap-6">
      <label class="flex flex-col gap-2">
        <span class="text-sm font-medium text-cast-mist">Name</span>
        <input
          v-model="draft.name"
          type="text"
          maxlength="24"
          autocomplete="nickname"
          class="w-full rounded-xl border border-cast-mist/30 bg-cast-ink/40 px-4 py-2 text-sm text-cast-fog outline-none transition placeholder:text-cast-mist/60 focus:border-cast-signal"
          placeholder="Your name"
        >
      </label>

      <ProfileColorPicker v-model="draft.colorId" />
      <ProfileAvatarPicker v-model="draft.avatarId" />
    </div>

    <template #footer>
      <Button
        variant="secondary"
        @click="close"
      >
        Cancel
      </Button>
      <Button
        :disabled="!draft.name.trim()"
        @click="save"
      >
        Save
      </Button>
    </template>
  </Dialog>
</template>
