<script setup lang="ts">
import type { TransferProgress } from '@/composables/use-file-transfer';
import TransferProgressView from '@/components/transfer-progress.vue';

defineProps<{
  waitingForAccept: boolean;
  progress: TransferProgress;
}>();

defineEmits<{
  dismiss: [];
}>();
</script>

<template>
  <div class="flex w-full max-w-md flex-col items-center gap-4">
    <p
      v-if="waitingForAccept"
      class="text-sm text-cast-signal"
    >
      Waiting for accept…
    </p>

    <TransferProgressView
      :progress="progress"
      @dismiss="$emit('dismiss')"
    />
  </div>
</template>
