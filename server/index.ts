import type { WebSocket } from 'ws';
import { networkInterfaces } from 'node:os';
import process from 'node:process';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.SIGNALING_PORT) || 3001;

interface PeerInfo {
  id: string;
  name: string;
  device: string;
}

interface Client {
  ws: WebSocket;
  peer: PeerInfo;
}

type ClientMessage
  = | { type: 'join'; name: string; device?: string }
    | { type: 'offer-transfer'; to: string; files: FileMeta[] }
    | { type: 'accept'; to: string }
    | { type: 'decline'; to: string }
    | { type: 'rtc-offer'; to: string; sdp: RTCSessionDescriptionInit }
    | { type: 'rtc-answer'; to: string; sdp: RTCSessionDescriptionInit }
    | { type: 'ice-candidate'; to: string; candidate: RTCIceCandidateInit | null };

interface FileMeta {
  id: string;
  name: string;
  size: number;
  type: string;
}

type ServerMessage
  = | { type: 'welcome'; peer: PeerInfo }
    | { type: 'peers'; peers: PeerInfo[] }
    | { type: 'peer-joined'; peer: PeerInfo }
    | { type: 'peer-left'; id: string }
    | { type: 'offer-transfer'; from: string; files: FileMeta[] }
    | { type: 'accept'; from: string }
    | { type: 'decline'; from: string }
    | { type: 'rtc-offer'; from: string; sdp: RTCSessionDescriptionInit }
    | { type: 'rtc-answer'; from: string; sdp: RTCSessionDescriptionInit }
    | { type: 'ice-candidate'; from: string; candidate: RTCIceCandidateInit | null }
    | { type: 'error'; message: string };

const clients = new Map<string, Client>();

const wss = new WebSocketServer({ host: '0.0.0.0', port: PORT });

function send(ws: WebSocket, message: ServerMessage) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function peerList(excludeId?: string): PeerInfo[] {
  return [...clients.values()]
    .filter((client) => client.peer.id !== excludeId)
    .map((client) => client.peer);
}

function broadcast(message: ServerMessage, excludeId?: string) {
  for (const [id, client] of clients) {
    if (id !== excludeId) {
      send(client.ws, message);
    }
  }
}

function relay(
  fromId: string,
  toId: string,
  message: Exclude<ServerMessage, { type: 'welcome' | 'peers' | 'peer-joined' | 'peer-left' | 'error' }>,
) {
  const target = clients.get(toId);
  if (!target) {
    const from = clients.get(fromId);
    if (from) {
      send(from.ws, { type: 'error', message: `Peer ${toId} is not available` });
    }
    return;
  }
  send(target.ws, message);
}

function removeClient(id: string) {
  if (!clients.has(id))
    return;
  clients.delete(id);
  broadcast({ type: 'peer-left', id });
}

wss.on('connection', (ws) => {
  let peerId: string | null = null;

  ws.on('message', (raw) => {
    let data: ClientMessage;
    try {
      data = JSON.parse(String(raw)) as ClientMessage;
    } catch {
      send(ws, { type: 'error', message: 'Invalid JSON' });
      return;
    }

    if (data.type === 'join') {
      if (peerId) {
        send(ws, { type: 'error', message: 'Already joined' });
        return;
      }

      const name = data.name?.trim() || 'Guest';
      const device = data.device?.trim() || 'unknown';
      peerId = crypto.randomUUID();

      const peer: PeerInfo = { id: peerId, name, device };
      clients.set(peerId, { ws, peer });

      send(ws, { type: 'welcome', peer });
      send(ws, { type: 'peers', peers: peerList(peerId) });
      broadcast({ type: 'peer-joined', peer }, peerId);
      return;
    }

    if (!peerId || !clients.has(peerId)) {
      send(ws, { type: 'error', message: 'Join before sending messages' });
      return;
    }

    switch (data.type) {
      case 'offer-transfer':
        relay(peerId, data.to, {
          type: 'offer-transfer',
          from: peerId,
          files: data.files,
        });
        break;
      case 'accept':
        relay(peerId, data.to, { type: 'accept', from: peerId });
        break;
      case 'decline':
        relay(peerId, data.to, { type: 'decline', from: peerId });
        break;
      case 'rtc-offer':
        relay(peerId, data.to, {
          type: 'rtc-offer',
          from: peerId,
          sdp: data.sdp,
        });
        break;
      case 'rtc-answer':
        relay(peerId, data.to, {
          type: 'rtc-answer',
          from: peerId,
          sdp: data.sdp,
        });
        break;
      case 'ice-candidate':
        relay(peerId, data.to, {
          type: 'ice-candidate',
          from: peerId,
          candidate: data.candidate,
        });
        break;
      default:
        send(ws, { type: 'error', message: 'Unknown message type' });
    }
  });

  ws.on('close', () => {
    if (peerId)
      removeClient(peerId);
  });

  ws.on('error', () => {
    if (peerId)
      removeClient(peerId);
  });
});

function lanAddresses(): string[] {
  const nets = networkInterfaces();
  const addresses: string[] = [];
  for (const entries of Object.values(nets)) {
    if (!entries)
      continue;
    for (const entry of entries) {
      if (entry.family === 'IPv4' && !entry.internal) {
        addresses.push(entry.address);
      }
    }
  }
  return addresses;
}

// eslint-disable-next-line no-console
console.info(`[signaling] listening on ws://0.0.0.0:${PORT}`);
for (const address of lanAddresses()) {
  // eslint-disable-next-line no-console
  console.info(`[signaling] LAN  ws://${address}:${PORT}`);
}
