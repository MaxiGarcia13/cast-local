import type { SignalingStatus } from './signaling-types';
import type { ClientMessage, ServerMessage } from '@cast-local/shared';
import { ref } from 'vue';
import { defaultSignalingUrl } from '@cast-local/shared';
import { guessDeviceName, guessDeviceType } from '@/utils/device-name';

interface UseSignalingSocketOptions {
  onMessage: (message: ServerMessage) => void;
  onDisconnected: () => void;
}

export interface ConnectOptions {
  roomId: string;
  asHost?: boolean;
  name?: string;
  device?: string;
}

export function useSignalingSocket(options: UseSignalingSocketOptions) {
  const status = ref<SignalingStatus>('idle');
  const lastError = ref<string | null>(null);
  const currentRoomId = ref<string | null>(null);

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

    const name = connectOptions.name ?? guessDeviceName();
    const device = connectOptions.device ?? guessDeviceType();

    lastError.value = null;
    currentRoomId.value = roomId;
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
      currentRoomId.value = null;
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
    currentRoomId.value = null;
    status.value = 'idle';
    lastError.value = null;
    options.onDisconnected();
    activeSocket?.close();
  }

  function setError(message: string) {
    lastError.value = message;
    status.value = 'error';
  }

  return {
    status,
    lastError,
    currentRoomId,
    send,
    connect,
    disconnect,
    setError,
  };
}
