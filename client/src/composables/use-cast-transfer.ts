import type { PeerInfo } from '@roomcast/shared';
import type { Ref } from 'vue';
import type { useSignaling } from './use-signaling';
import { computed, ref, watch } from 'vue';
import { fileToMeta } from '@/domain/p2p';
import { textPreview } from '@/utils/text-preview';
import { useFileTransfer } from './use-file-transfer';
import { usePeerConnection } from './use-peer-connection';

type Signaling = ReturnType<typeof useSignaling>;

export function useCastTransfer(
  signaling: Signaling,
  files: Ref<File[]>,
  text: Ref<string>,
) {
  const remotePeerId = ref<string | null>(null);
  const role = ref<'idle' | 'sender' | 'receiver'>('idle');
  const pendingFiles = ref<File[]>([]);
  const pendingFileMetas = ref(fileToMetaList([]));
  const pendingText = ref<string | null>(null);
  const waitingForAccept = ref(false);

  const fileTransfer = useFileTransfer();

  const isBusy = computed(() => {
    const phase = fileTransfer.progress.value.phase;
    return waitingForAccept.value || phase === 'sending' || phase === 'receiving';
  });

  const hasPayload = computed(() =>
    files.value.length > 0 || text.value.trim().length > 0,
  );

  const peerConnection = usePeerConnection({
    onIceCandidate: (candidate) => {
      if (!remotePeerId.value) {
        return;
      }
      signaling.sendIceCandidate(remotePeerId.value, candidate);
    },
    onDataChannel: (channel) => {
      if (role.value === 'receiver') {
        fileTransfer.attachReceiver(channel);
        return;
      }
      if (role.value === 'sender') {
        void sendWhenReady(channel);
      }
    },
    onConnectionStateChange: (state) => {
      if (state === 'failed') {
        waitingForAccept.value = false;
        fileTransfer.setError('ICE failed', 'Could not reach the other device on this network.');
      }
      if (state === 'disconnected') {
        const phase = fileTransfer.progress.value.phase;
        if (phase === 'sending' || phase === 'receiving') {
          fileTransfer.setError('Connection lost during transfer.');
        }
      }
    },
  });

  const incomingPeerName = computed(() => {
    const offer = signaling.incomingOffer.value;
    if (!offer) {
      return 'Someone';
    }
    return signaling.peers.value.find((peer) => peer.id === offer.from)?.name ?? 'Someone';
  });

  async function sendWhenReady(channel: RTCDataChannel) {
    try {
      await fileTransfer.sendPayload(channel, {
        files: pendingFiles.value,
        fileMetas: pendingFileMetas.value,
        text: pendingText.value,
      });
    } catch (error) {
      fileTransfer.setError(error, 'Send failed');
    }
  }

  function fileToMetaList(selectedFiles: File[]) {
    return selectedFiles.map((file) => fileToMeta(file));
  }

  function resetTransferState() {
    waitingForAccept.value = false;
    role.value = 'idle';
    remotePeerId.value = null;
    pendingFiles.value = [];
    pendingFileMetas.value = [];
    pendingText.value = null;
    peerConnection.close();
    fileTransfer.stopReceiver();
    fileTransfer.resetProgress();
  }

  function dismissProgress() {
    if (
      fileTransfer.progress.value.phase === 'complete'
      || fileTransfer.progress.value.phase === 'error'
    ) {
      resetTransferState();
    }
  }

  function requestTransfer(peer: PeerInfo) {
    if (!hasPayload.value || isBusy.value) {
      return;
    }

    resetTransferState();
    role.value = 'sender';
    remotePeerId.value = peer.id;
    pendingFiles.value = [...files.value];
    pendingFileMetas.value = fileToMetaList(pendingFiles.value);
    pendingText.value = text.value.trim() || null;
    waitingForAccept.value = true;
    signaling.offerTransfer(
      peer.id,
      pendingFileMetas.value,
      textPreview(pendingText.value ?? ''),
    );
  }

  function acceptIncoming() {
    const offer = signaling.incomingOffer.value;
    if (!offer) {
      return;
    }

    role.value = 'receiver';
    remotePeerId.value = offer.from;
    signaling.acceptTransfer(offer.from);
    signaling.clearIncomingOffer();
  }

  function declineIncoming() {
    const offer = signaling.incomingOffer.value;
    if (!offer) {
      return;
    }

    signaling.declineTransfer(offer.from);
    signaling.clearIncomingOffer();
  }

  watch(
    () => signaling.lastAcceptFrom.value,
    async (from) => {
      if (!from || role.value !== 'sender' || from !== remotePeerId.value) {
        return;
      }

      waitingForAccept.value = false;
      signaling.lastAcceptFrom.value = null;

      try {
        const offer = await peerConnection.createAsOfferer();
        signaling.sendRtcOffer(from, offer);
      } catch (error) {
        fileTransfer.setError(error, 'Failed to create offer');
      }
    },
  );

  watch(
    () => signaling.lastDeclineFrom.value,
    (from) => {
      if (!from || from !== remotePeerId.value) {
        return;
      }
      signaling.lastDeclineFrom.value = null;
      waitingForAccept.value = false;
      fileTransfer.setError('Transfer declined');
      role.value = 'idle';
    },
  );

  watch(
    () => signaling.lastRtcOffer.value,
    async (message) => {
      if (!message || role.value !== 'receiver' || message.from !== remotePeerId.value) {
        return;
      }

      signaling.lastRtcOffer.value = null;

      try {
        const answer = await peerConnection.createAsAnswerer(message.sdp);
        signaling.sendRtcAnswer(message.from, answer);
      } catch (error) {
        fileTransfer.setError(error, 'Failed to create answer');
      }
    },
  );

  watch(
    () => signaling.lastRtcAnswer.value,
    async (message) => {
      if (!message || role.value !== 'sender' || message.from !== remotePeerId.value) {
        return;
      }

      signaling.lastRtcAnswer.value = null;

      try {
        await peerConnection.applyAnswer(message.sdp);
      } catch (error) {
        fileTransfer.setError(error, 'Failed to apply answer');
      }
    },
  );

  watch(
    () => signaling.iceVersion.value,
    async () => {
      const candidates = signaling.takeIceCandidates();
      for (const message of candidates) {
        if (message.from !== remotePeerId.value) {
          continue;
        }
        try {
          await peerConnection.addIceCandidate(message.candidate);
        } catch (error) {
          fileTransfer.setError(error, 'ICE failed');
        }
      }
    },
  );

  return {
    progress: fileTransfer.progress,
    incomingOffer: signaling.incomingOffer,
    incomingPeerName,
    waitingForAccept,
    isBusy,
    requestTransfer,
    acceptIncoming,
    declineIncoming,
    resetTransferState,
    dismissProgress,
  };
}
