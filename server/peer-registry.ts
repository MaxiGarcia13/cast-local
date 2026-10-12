import type { WebSocket } from 'ws';
import type { PeerInfo, ServerMessage } from '@/domain/p2p';
import {
  areInSameRoom,
  leaveRoom,
  listRoomPeerIds,
} from './room-registry';

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

export function listPeersInRoom(roomId: string, excludeId?: string): PeerInfo[] {
  return listRoomPeerIds(roomId, excludeId)
    .map((id) => clients.get(id)?.peer)
    .filter((peer): peer is PeerInfo => Boolean(peer));
}

export function broadcastToRoom(
  roomId: string,
  message: ServerMessage,
  excludeId?: string,
) {
  for (const peerId of listRoomPeerIds(roomId, excludeId)) {
    const client = clients.get(peerId);
    if (client) {
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
  if (!target || !areInSameRoom(fromId, toId)) {
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

  const roomId = leaveRoom(peerId);
  clients.delete(peerId);

  if (roomId) {
    broadcastToRoom(roomId, { type: 'peer-left', id: peerId });
  }
}
