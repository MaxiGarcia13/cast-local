import type { Ref } from 'vue';
import type { useSignaling } from './use-signaling';
import type { PeerInfo } from '@/domain/p2p';
import { computed, ref, watch } from 'vue';
import { fileToMeta } from '@/domain/p2p';
import { useFileTransfer } from './use-file-transfer';
import { usePeerConnection } from './use-peer-connection';

type Signaling = ReturnType<typeof useSignaling>;

export function useCastTransfer(signaling: Signaling, files: Ref<File[]>) {
  const remotePeerId = ref<string | null>(null);
  const role = ref<'idle' | 'sender' | 'receiver'>('idle');
  const pendingFileMetas = ref(fileToMetaList([]));
  const waitingForAccept = ref(false);

  const fileTransfer = useFileTransfer();

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
      await fileTransfer.sendFiles(channel, files.value, pendingFileMetas.value);
    } catch (error) {
      fileTransfer.setError(error instanceof Error ? error.message : 'Send failed');
    }
  }

  function fileToMetaList(selectedFiles: File[]) {
    return selectedFiles.map((file) => fileToMeta(file));
  }

  function resetTransferState() {
    waitingForAccept.value = false;
    role.value = 'idle';
    remotePeerId.value = null;
    pendingFileMetas.value = [];
    peerConnection.close();
    fileTransfer.stopReceiver();
    fileTransfer.resetProgress();
  }

  function requestTransfer(peer: PeerInfo) {
    if (files.value.length === 0) {
      return;
    }

    resetTransferState();
    role.value = 'sender';
    remotePeerId.value = peer.id;
    pendingFileMetas.value = fileToMetaList(files.value);
    waitingForAccept.value = true;
    signaling.offerTransfer(peer.id, pendingFileMetas.value);
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
        fileTransfer.setError(error instanceof Error ? error.message : 'Failed to create offer');
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
        fileTransfer.setError(error instanceof Error ? error.message : 'Failed to create answer');
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
        fileTransfer.setError(error instanceof Error ? error.message : 'Failed to apply answer');
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
          fileTransfer.setError(error instanceof Error ? error.message : 'ICE failed');
        }
      }
    },
  );

  return {
    progress: fileTransfer.progress,
    incomingOffer: signaling.incomingOffer,
    incomingPeerName,
    waitingForAccept,
    requestTransfer,
    acceptIncoming,
    declineIncoming,
    resetTransferState,
  };
}
