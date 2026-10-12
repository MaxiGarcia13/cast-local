import type { WebSocket } from 'ws';
import type { PeerInfo, ServerMessage } from '@/domain/p2p';

interface Client {
  ws: WebSocket;
  peer: PeerInfo;
}

type RelayMessage = Exclude<
  ServerMessage,
  { type: 'welcome' | 'peers' | 'peer-joined' | 'peer-left' | 'error' }
>;

const clients = new Map<string, Client>();

export function send(ws: WebSocket, message: ServerMessage) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

export function listPeers(excludeId?: string): PeerInfo[] {
  return [...clients.values()]
    .filter((client) => client.peer.id !== excludeId)
    .map((client) => client.peer);
}

export function broadcast(message: ServerMessage, excludeId?: string) {
  for (const [id, client] of clients) {
    if (id !== excludeId) {
      send(client.ws, message);
    }
  }
}

export function registerPeer(ws: WebSocket, peer: PeerInfo) {
  clients.set(peer.id, { ws, peer });
}

export function getClient(peerId: string): Client | undefined {
  return clients.get(peerId);
}

export function hasPeer(peerId: string): boolean {
  return clients.has(peerId);
}

export function relay(fromId: string, toId: string, message: RelayMessage) {
  const target = clients.get(toId);
  if (!target) {
    const sender = clients.get(fromId);
    if (sender) {
      send(sender.ws, { type: 'error', message: `Peer ${toId} is not available` });
    }
    return;
  }
  send(target.ws, message);
}

export function removePeer(peerId: string) {
  if (!clients.has(peerId)) {
    return;
  }
  clients.delete(peerId);
  broadcast({ type: 'peer-left', id: peerId });
}
