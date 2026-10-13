import type { ClientMessage, ServerMessage } from '@roomcast/shared';
import type { SignalingStatus } from './signaling-types';
import { defaultSignalingUrl } from '@roomcast/shared';
import { ref } from 'vue';
import { userProfileStore } from '@/stores/user-profile';
import { guessDeviceName, guessDeviceType } from '@/utils/device-name';

interface UseSignalingSocketOptions {
  onMessage: (message: ServerMessage) => void;
  onDisconnected: () => void;
}

interface ConnectOptions {
  roomId: string;
  asHost?: boolean;
  name?: string;
  device?: string;
  avatarId?: string;
  colorId?: string;
}

interface ProfileUpdate {
  name: string;
  avatarId: string;
  colorId: string;
}

export function useSignalingSocket(options: UseSignalingSocketOptions) {
  const status = ref<SignalingStatus>('idle');
  const lastError = ref<string | null>(null);

  let socket: WebSocket | null = null;

  function send(message: ClientMessage) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      lastError.value = 'Not connected to signaling server';
      return;
    }
    socket.send(JSON.stringify(message));
  }

  function connect(connectOptions: ConnectOptions) {
    const roomId = connectOptions.roomId.trim();
    if (!roomId) {
      lastError.value = 'Room id is required';
      status.value = 'error';
      return;
    }

    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const profile = userProfileStore.get();
    const name = connectOptions.name ?? profile.name ?? guessDeviceName();
    const device = connectOptions.device ?? guessDeviceType();
    const avatarId = connectOptions.avatarId ?? profile.avatarId;
    const colorId = connectOptions.colorId ?? profile.colorId;

    lastError.value = null;
    status.value = 'connecting';

    const nextSocket = new WebSocket(defaultSignalingUrl());
    socket = nextSocket;

    nextSocket.addEventListener('open', () => {
      if (socket !== nextSocket) {
        return;
      }
      status.value = 'connected';
      send({
        type: 'join-room',
        roomId,
        name,
        device,
        avatarId,
        colorId,
        asHost: Boolean(connectOptions.asHost),
      });
    });

    nextSocket.addEventListener('message', (event) => {
      if (socket !== nextSocket) {
        return;
      }
      try {
        options.onMessage(JSON.parse(String(event.data)) as ServerMessage);
      } catch {
        lastError.value = 'Invalid message from signaling server';
      }
    });

    nextSocket.addEventListener('close', () => {
      if (socket !== nextSocket) {
        return;
      }
      socket = null;
      options.onDisconnected();
      if (status.value !== 'error') {
        status.value = 'idle';
      }
    });

    nextSocket.addEventListener('error', () => {
      if (socket !== nextSocket) {
        return;
      }
      lastError.value = 'Failed to connect to signaling server';
      status.value = 'error';
    });
  }

  function disconnect() {
    const activeSocket = socket;
    socket = null;
    status.value = 'idle';
    lastError.value = null;
    options.onDisconnected();
    activeSocket?.close();
  }

  function setError(message: string) {
    lastError.value = message;
    status.value = 'error';
  }

  function updateProfile(profile: ProfileUpdate) {
    send({
      type: 'update-profile',
      name: profile.name,
      avatarId: profile.avatarId,
      colorId: profile.colorId,
    });
  }

  return {
    status,
    lastError,
    send,
    connect,
    disconnect,
    setError,
    updateProfile,
  };
}
