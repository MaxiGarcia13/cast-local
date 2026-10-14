const ROOM_ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const ROOM_ID_LENGTH = 8;

/** Short URL-safe room id for /room/:id */
export function createRoomId(length = ROOM_ID_LENGTH): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let roomId = '';

  for (const byte of bytes) {
    roomId += ROOM_ID_ALPHABET[byte % ROOM_ID_ALPHABET.length];
  }

  return roomId;
}

export function isValidRoomId(roomId: string): boolean {
  return /^[a-z0-9]{6,12}$/.test(roomId.trim());
}

/** Accept a raw room id or an invite URL/path and return a normalized id. */
export function parseRoomIdInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const fromPath = extractRoomIdFromPath(trimmed);
  if (fromPath) {
    return isValidRoomId(fromPath) ? fromPath : null;
  }

  const roomId = trimmed.toLowerCase();
  return isValidRoomId(roomId) ? roomId : null;
}

function extractRoomIdFromPath(raw: string): string | null {
  try {
    const url = raw.includes('://')
      ? new URL(raw)
      : new URL(raw, 'https://roomcast.local');
    const match = url.pathname.match(/\/room\/([a-z0-9]+)(?:\/join)?\/?$/i);
    return match?.[1]?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

export function roomHostPath(roomId: string): string {
  return `/room/${roomId}`;
}

export function roomJoinPath(roomId: string): string {
  return `/room/${roomId}/join`;
}
