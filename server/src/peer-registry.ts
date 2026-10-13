import type { PeerInfo, ServerMessage } from '@cast-local/shared';
import type { WebSocket } from 'ws';
import {
  areInSameRoom,
  dissolveRoom,
  getPeerRoom,
  isRoomHost,
  leaveRoom,
  listRoomPeerIds,
} from './room-registry';

interface Client {
  ws: WebSocket;
  peer: PeerInfo;
}

type RelayMessage = Exclude<
  ServerMessage,
  { type: 'welcome' | 'peers' | 'peer-joined' | 'peer-left' | 'room-closed' | 'error' }
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

function removeClient(peerId: string) {
  const client = clients.get(peerId);
  clients.delete(peerId);
  return client;
}

/** Host left: notify guests, drop everyone from the room. */
function closeRoomFromHost(hostId: string) {
  const roomId = getPeerRoom(hostId);
  if (!roomId) {
    removeClient(hostId);
    return;
  }

  const guestIds = listRoomPeerIds(roomId, hostId);
  broadcastToRoom(roomId, { type: 'room-closed' }, hostId);
  dissolveRoom(roomId);
  removeClient(hostId);

  for (const peerId of guestIds) {
    removeClient(peerId);
  }
}

export function removePeer(peerId: string) {
  if (!clients.has(peerId)) {
    return;
  }

  if (isRoomHost(peerId)) {
    closeRoomFromHost(peerId);
    return;
  }

  const roomId = leaveRoom(peerId);
  removeClient(peerId);

  if (roomId) {
    broadcastToRoom(roomId, { type: 'peer-left', id: peerId });
  }
}
