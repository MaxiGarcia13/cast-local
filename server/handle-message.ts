import type { WebSocket } from 'ws';
import type { ClientMessage, PeerInfo } from '@/domain/p2p';
import {
  broadcast,
  hasPeer,
  listPeers,
  registerPeer,
  relay,
  send,
} from './peer-registry';

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

  if (message.type === 'join') {
    if (peerId) {
      send(ws, { type: 'error', message: 'Already joined' });
      return peerId;
    }

    const name = message.name?.trim() || 'Guest';
    const device = message.device?.trim() || 'unknown';
    const joinedPeerId = crypto.randomUUID();
    const peer: PeerInfo = { id: joinedPeerId, name, device };

    registerPeer(ws, peer);
    send(ws, { type: 'welcome', peer });
    send(ws, { type: 'peers', peers: listPeers(joinedPeerId) });
    broadcast({ type: 'peer-joined', peer }, joinedPeerId);

    return joinedPeerId;
  }

  if (!peerId || !hasPeer(peerId)) {
    send(ws, { type: 'error', message: 'Join before sending messages' });
    return peerId;
  }

  switch (message.type) {
    case 'offer-transfer':
      relay(peerId, message.to, {
        type: 'offer-transfer',
        from: peerId,
        files: message.files,
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
