import type { ClientMessage, PeerInfo } from '@roomcast/shared';
import type { WebSocket } from 'ws';
import {
  broadcastToRoom,
  hasPeer,
  listPeersInRoom,
  registerPeer,
  relay,
  send,
} from './peer-registry.js';
import { joinRoomAsGuest, joinRoomAsHost } from './room-registry.js';

export function handleClientMessage(
  ws: WebSocket,
  peerId: string | null,
  raw: unknown,
): string | null {
  let message: ClientMessage;
  try {
    message = JSON.parse(String(raw)) as ClientMessage;
  } catch {
    send(ws, { type: 'error', message: 'Invalid JSON' });
    return peerId;
  }

  if (message.type === 'join-room') {
    if (peerId) {
      send(ws, { type: 'error', message: 'Already joined' });
      return peerId;
    }

    const roomId = message.roomId?.trim();
    if (!roomId) {
      send(ws, { type: 'error', message: 'Room id is required' });
      return peerId;
    }

    const name = message.name?.trim() || 'Guest';
    const device = message.device?.trim() || 'unknown';
    const joinedPeerId = crypto.randomUUID();
    const peer: PeerInfo = { id: joinedPeerId, name, device };
    const asHost = Boolean(message.asHost);

    try {
      if (asHost) {
        joinRoomAsHost(roomId, joinedPeerId);
      } else {
        joinRoomAsGuest(roomId, joinedPeerId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to join room';
      send(ws, { type: 'error', message: errorMessage });
      return peerId;
    }

    registerPeer(ws, peer);

    send(ws, { type: 'welcome', peer, roomId });
    send(ws, { type: 'peers', peers: listPeersInRoom(roomId, joinedPeerId) });
    broadcastToRoom(roomId, { type: 'peer-joined', peer }, joinedPeerId);

    return joinedPeerId;
  }

  if (!peerId || !hasPeer(peerId)) {
    send(ws, { type: 'error', message: 'Join a room before sending messages' });
    return peerId;
  }

  switch (message.type) {
    case 'offer-transfer':
      relay(peerId, message.to, {
        type: 'offer-transfer',
        from: peerId,
        files: message.files,
        textPreview: message.textPreview ?? null,
      });
      break;
    case 'accept':
      relay(peerId, message.to, { type: 'accept', from: peerId });
      break;
    case 'decline':
      relay(peerId, message.to, { type: 'decline', from: peerId });
      break;
    case 'rtc-offer':
      relay(peerId, message.to, {
        type: 'rtc-offer',
        from: peerId,
        sdp: message.sdp,
      });
      break;
    case 'rtc-answer':
      relay(peerId, message.to, {
        type: 'rtc-answer',
        from: peerId,
        sdp: message.sdp,
      });
      break;
    case 'ice-candidate':
      relay(peerId, message.to, {
        type: 'ice-candidate',
        from: peerId,
        candidate: message.candidate,
      });
      break;
    default:
      send(ws, { type: 'error', message: 'Unknown message type' });
  }

  return peerId;
}
