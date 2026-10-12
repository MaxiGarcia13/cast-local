const rooms = new Map<string, Set<string>>();
const peerRoom = new Map<string, string>();

export function joinRoom(roomId: string, peerId: string) {
  const normalizedRoomId = roomId.trim();
  if (!normalizedRoomId) {
    throw new Error('Room id is required');
  }

  leaveRoom(peerId);

  let members = rooms.get(normalizedRoomId);
  if (!members) {
    members = new Set();
    rooms.set(normalizedRoomId, members);
  }

  members.add(peerId);
  peerRoom.set(peerId, normalizedRoomId);
  return normalizedRoomId;
}

export function leaveRoom(peerId: string): string | null {
  const roomId = peerRoom.get(peerId);
  if (!roomId) {
    return null;
  }

  peerRoom.delete(peerId);
  const members = rooms.get(roomId);
  if (!members) {
    return roomId;
  }

  members.delete(peerId);
  if (members.size === 0) {
    rooms.delete(roomId);
  }

  return roomId;
}

export function getPeerRoom(peerId: string): string | null {
  return peerRoom.get(peerId) ?? null;
}

export function listRoomPeerIds(roomId: string, excludeId?: string): string[] {
  const members = rooms.get(roomId);
  if (!members) {
    return [];
  }

  return [...members].filter((id) => id !== excludeId);
}

export function areInSameRoom(peerA: string, peerB: string): boolean {
  const roomA = peerRoom.get(peerA);
  const roomB = peerRoom.get(peerB);
  return Boolean(roomA && roomA === roomB);
}
