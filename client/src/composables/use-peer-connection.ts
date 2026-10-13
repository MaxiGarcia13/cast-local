import type { IceCandidate, SessionDescription } from '@roomcast/shared';
import { onUnmounted, ref } from 'vue';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
];

interface UsePeerConnectionOptions {
  onIceCandidate: (candidate: IceCandidate | null) => void;
  onDataChannel: (channel: RTCDataChannel) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

export function usePeerConnection(options: UsePeerConnectionOptions) {
  const connectionState = ref<RTCPeerConnectionState>('new');
  let peerConnection: RTCPeerConnection | null = null;
  let dataChannel: RTCDataChannel | null = null;
  const pendingIceCandidates: RTCIceCandidateInit[] = [];

  function wirePeerConnection(connection: RTCPeerConnection) {
    connection.addEventListener('icecandidate', (event) => {
      options.onIceCandidate(event.candidate ? event.candidate.toJSON() : null);
    });

    connection.addEventListener('connectionstatechange', () => {
      connectionState.value = connection.connectionState;
      options.onConnectionStateChange?.(connection.connectionState);
    });

    connection.addEventListener('datachannel', (event) => {
      dataChannel = event.channel;
      options.onDataChannel(event.channel);
    });
  }

  async function flushPendingIceCandidates() {
    if (!peerConnection?.remoteDescription) {
      return;
    }

    const queued = pendingIceCandidates.splice(0, pendingIceCandidates.length);
    for (const candidate of queued) {
      await peerConnection.addIceCandidate(candidate);
    }
  }

  async function createAsOfferer(): Promise<SessionDescription> {
    close();

    peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    wirePeerConnection(peerConnection);

    dataChannel = peerConnection.createDataChannel('cast-files', { ordered: true });
    options.onDataChannel(dataChannel);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return peerConnection.localDescription!.toJSON();
  }

  async function createAsAnswerer(offer: SessionDescription): Promise<SessionDescription> {
    close();

    peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    wirePeerConnection(peerConnection);

    await peerConnection.setRemoteDescription(offer);
    await flushPendingIceCandidates();

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return peerConnection.localDescription!.toJSON();
  }

  async function applyAnswer(answer: SessionDescription) {
    if (!peerConnection) {
      throw new Error('No peer connection to apply answer');
    }
    await peerConnection.setRemoteDescription(answer);
    await flushPendingIceCandidates();
  }

  async function addIceCandidate(candidate: IceCandidate | null) {
    if (!candidate?.candidate) {
      return;
    }
    if (!peerConnection?.remoteDescription) {
      pendingIceCandidates.push(candidate);
      return;
    }
    await peerConnection.addIceCandidate(candidate);
  }

  function getDataChannel() {
    return dataChannel;
  }

  function close() {
    dataChannel?.close();
    dataChannel = null;
    peerConnection?.close();
    peerConnection = null;
    pendingIceCandidates.length = 0;
    connectionState.value = 'closed';
  }

  onUnmounted(() => {
    close();
  });

  return {
    connectionState,
    createAsOfferer,
    createAsAnswerer,
    applyAnswer,
    addIceCandidate,
    getDataChannel,
    close,
  };
}
