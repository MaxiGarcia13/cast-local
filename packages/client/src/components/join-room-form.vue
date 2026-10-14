<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from '@/components/button.vue';
import { parseRoomIdInput, roomJoinPath } from '@/utils/room-id';

const router = useRouter();
const roomInput = ref('');
const showError = ref(false);

const canJoin = computed(() => roomInput.value.trim().length > 0);

function joinRoom() {
  const roomId = parseRoomIdInput(roomInput.value);
  if (!roomId) {
    showError.value = true;
    return;
  }

  showError.value = false;
  void router.push(roomJoinPath(roomId));
}

function onInput() {
  showError.value = false;
}
</script>

<template>
  <form
    class="flex w-full flex-col gap-4"
    @submit.prevent="joinRoom"
  >
    <div class="flex flex-col gap-2">
      <label
        for="room-code"
        class="text-sm font-medium text-cast-mist"
      >
        Room code or invite link
      </label>
      <input
        id="room-code"
        v-model="roomInput"
        type="text"
        autocomplete="off"
        spellcheck="false"
        placeholder="e.g. a1b2c3d4 or paste invite link"
        class="w-full rounded-xl border border-cast-mist/30 bg-cast-panel/60 px-4 py-4 text-sm text-cast-fog outline-none transition placeholder:text-cast-mist/60 focus:border-cast-signal"
        :aria-invalid="showError"
        aria-describedby="room-code-error"
        @input="onInput"
      >
      <p
        v-if="showError"
        id="room-code-error"
        class="text-sm text-cast-coral"
        role="alert"
      >
        Enter a valid room code or invite link.
      </p>
    </div>

    <Button
      type="submit"
      size="lg"
      class="self-center"
      :disabled="!canJoin"
    >
      Join room
    </Button>
  </form>
</template>
