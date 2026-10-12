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
