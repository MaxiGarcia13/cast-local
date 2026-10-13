<script setup lang="ts">
import type { PeerInfo } from '@roomcast/shared';
import { useStore } from '@nanostores/vue';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  IncomingOffer,
  RoomGuestPanel,
  RoomHeader,
  RoomHostPanel,
  RoomInvalid,
  RoomInvite,
  RoomToolbar,
  RoomTransferPanel,
} from '@/components/room';
import { useCastTransfer } from '@/composables/use-cast-transfer';
import { useRoomSession } from '@/composables/use-room-session';
import { useScrollIntoView } from '@/composables/use-scroll-into-view';
import { useSignaling } from '@/composables/use-signaling';
import {
  clearSharePayload,
  hasSharePayload,
  sharePayloadStore,
} from '@/stores/share-payload';
import { guessDeviceName } from '@/utils/device-name';
import { formatReadySummary } from '@/utils/ready-summary';
import { isValidRoomId } from '@/utils/room-id';

interface Props {
  roomId: string;
  roomRole: 'host' | 'guest';
}

const props = defineProps<Props>();
const router = useRouter();

const payload = useStore(sharePayloadStore);
const hasPayload = useStore(hasSharePayload);

const files = ref<File[]>([]);
const text = ref('');
const transferPanel = ref<HTMLElement | null>(null);

watch(
  payload,
  (nextPayload) => {
    files.value = [...nextPayload.files] as File[];
    text.value = nextPayload.text;
  },
  { immediate: true, deep: true },
);

const signaling = useSignaling();
const {
  peers,
  self,
  status,
  lastError,
  disconnect,
} = signaling;

const {
  progress,
  incomingOffer,
  incomingPeerName,
  waitingForAccept,
  isBusy,
  requestTransfer,
  acceptIncoming,
  declineIncoming,
  resetTransferState,
  dismissProgress,
} = useCastTransfer(signaling, files, text);

const roomIsValid = computed(() => isValidRoomId(props.roomId));
const isHost = computed(() => props.roomRole === 'host');
const selfName = computed(() => self.value?.name ?? guessDeviceName());
const radarDisabled = computed(() => !hasPayload.value || isBusy.value);

const statusLabel = computed(() => {
  switch (status.value) {
    case 'connecting':
      return 'Connecting…';
    case 'connected':
      return 'Connected to room';
    case 'error':
      return lastError.value ?? 'Connection error';
    default:
      return 'Offline';
  }
});

const readySummary = computed(() => formatReadySummary({
  isHost: isHost.value,
  fileCount: payload.value.files.length,
  text: payload.value.text,
}));

useRoomSession({
  roomId: props.roomId,
  role: props.roomRole,
  roomIsValid: () => roomIsValid.value,
  signaling,
  onLeaveCleanup: resetTransferState,
});

useScrollIntoView({
  target: transferPanel,
  sources: [() => progress.value.phase, waitingForAccept, () => progress.value.receivedText],
  shouldScroll: () => {
    return waitingForAccept.value
      || progress.value.phase !== 'idle'
      || Boolean(progress.value.receivedText);
  },
});

function leaveRoom() {
  resetTransferState();
  disconnect();
  clearSharePayload();
  void router.push('/');
}

function onSelectPeer(peer: PeerInfo) {
  requestTransfer(peer);
}
</script>

<template>
  <div
    class="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6 py-12"
    style="animation: cast-fade-up 0.6s ease-out both"
  >
    <RoomHeader
      :room-id="roomId"
      :status-label="statusLabel"
      :is-error="status === 'error'"
    />

    <RoomInvalid v-if="!roomIsValid" />

    <main
      v-else
      class="flex flex-1 flex-col items-center gap-8"
    >
      <RoomToolbar
        :ready-summary="readySummary"
        @leave="leaveRoom"
      />

      <RoomInvite
        v-if="isHost"
        :room-id="roomId"
      />

      <RoomHostPanel
        v-if="isHost"
        :has-payload="hasPayload"
        :peers="peers"
        :self-name="selfName"
        :radar-disabled="radarDisabled"
        @select="onSelectPeer"
      />

      <RoomGuestPanel v-else />

      <div ref="transferPanel">
        <RoomTransferPanel
          :waiting-for-accept="waitingForAccept"
          :progress="progress"
          @dismiss="dismissProgress"
        />
      </div>
    </main>

    <IncomingOffer
      v-if="incomingOffer"
      :peer-name="incomingPeerName"
      :files="incomingOffer.files"
      :text-preview="incomingOffer.textPreview"
      @accept="acceptIncoming"
      @decline="declineIncoming"
    />
  </div>
</template>
