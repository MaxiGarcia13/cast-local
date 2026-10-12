interface RoomState {
  members: Set<string>;
  hostId: string;
}

const rooms = new Map<string, RoomState>();
const peerRoom = new Map<string, string>();

export function joinRoomAsHost(roomId: string, peerId: string): string {
  const normalizedRoomId = roomId.trim();
  if (!normalizedRoomId) {
    throw new Error('Room id is required');
  }

  const existing = rooms.get(normalizedRoomId);
  if (existing) {
    throw new Error('Room already has a host');
  }

  leaveRoom(peerId);

  rooms.set(normalizedRoomId, {
    members: new Set([peerId]),
    hostId: peerId,
  });
  peerRoom.set(peerId, normalizedRoomId);
  return normalizedRoomId;
}

export function joinRoomAsGuest(roomId: string, peerId: string): string {
  const normalizedRoomId = roomId.trim();
  if (!normalizedRoomId) {
    throw new Error('Room id is required');
  }

  const room = rooms.get(normalizedRoomId);
  if (!room) {
    throw new Error('Room is not open');
  }

  leaveRoom(peerId);

  room.members.add(peerId);
  peerRoom.set(peerId, normalizedRoomId);
  return normalizedRoomId;
}

export function leaveRoom(peerId: string): string | null {
  const roomId = peerRoom.get(peerId);
  if (!roomId) {
    return null;
  }

  peerRoom.delete(peerId);
  const room = rooms.get(roomId);
  if (!room) {
    return roomId;
  }

  room.members.delete(peerId);
  if (room.members.size === 0) {
    rooms.delete(roomId);
  }

  return roomId;
}

export function getPeerRoom(peerId: string): string | null {
  return peerRoom.get(peerId) ?? null;
}

export function getRoomHostId(roomId: string): string | null {
  return rooms.get(roomId)?.hostId ?? null;
}

export function isRoomHost(peerId: string): boolean {
  const roomId = peerRoom.get(peerId);
  if (!roomId) {
    return false;
  }
  return rooms.get(roomId)?.hostId === peerId;
}

/** Removes every member from the room map. Returns peer ids that were in the room. */
export function dissolveRoom(roomId: string): string[] {
  const room = rooms.get(roomId);
  if (!room) {
    return [];
  }

  const memberIds = [...room.members];
  for (const peerId of memberIds) {
    peerRoom.delete(peerId);
  }
  rooms.delete(roomId);
  return memberIds;
}

export function listRoomPeerIds(roomId: string, excludeId?: string): string[] {
  const room = rooms.get(roomId);
  if (!room) {
    return [];
  }

  return [...room.members].filter((id) => id !== excludeId);
}

export function areInSameRoom(peerA: string, peerB: string): boolean {
  const roomA = peerRoom.get(peerA);
  const roomB = peerRoom.get(peerB);
  return Boolean(roomA && roomA === roomB);
}
