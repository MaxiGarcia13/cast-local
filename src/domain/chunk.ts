/** Bytes per data-channel binary frame (payload only, excluding framing header). */
export const CHUNK_SIZE = 64 * 1024;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const MAX_FILE_ID_BYTES = 0xFFFF;

/**
 * Binary frame layout:
 * [u16 fileIdLen][fileId utf8][u32 index][u32 total][payload]
 */
export function encodeChunk(
  fileId: string,
  index: number,
  total: number,
  payload: ArrayBuffer | Uint8Array,
): ArrayBuffer {
  const fileIdBytes = textEncoder.encode(fileId);
  if (fileIdBytes.byteLength > MAX_FILE_ID_BYTES) {
    throw new Error('fileId too long');
  }

  const payloadBytes = payload instanceof Uint8Array ? payload : new Uint8Array(payload);
  const frame = new ArrayBuffer(2 + fileIdBytes.byteLength + 8 + payloadBytes.byteLength);
  const view = new DataView(frame);
  const bytes = new Uint8Array(frame);

  view.setUint16(0, fileIdBytes.byteLength);
  bytes.set(fileIdBytes, 2);

  const headerOffset = 2 + fileIdBytes.byteLength;
  view.setUint32(headerOffset, index);
  view.setUint32(headerOffset + 4, total);
  bytes.set(payloadBytes, headerOffset + 8);

  return frame;
}

export function decodeChunk(data: ArrayBuffer | ArrayBufferView): {
  fileId: string;
  index: number;
  total: number;
  payload: Uint8Array;
} {
  const bytes
    = data instanceof ArrayBuffer
      ? new Uint8Array(data)
      : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  const fileIdByteLength = view.getUint16(0);
  const fileId = textDecoder.decode(bytes.subarray(2, 2 + fileIdByteLength));
  const headerOffset = 2 + fileIdByteLength;
  const index = view.getUint32(headerOffset);
  const total = view.getUint32(headerOffset + 4);
  const payload = bytes.subarray(headerOffset + 8);

  return { fileId, index, total, payload };
}

export function chunkCount(size: number, chunkSize = CHUNK_SIZE): number {
  if (size <= 0) {
    return 1;
  }
  return Math.ceil(size / chunkSize);
}

/** Slice one chunk from a File/Blob without loading the whole file. */
export async function readChunk(
  file: Blob,
  index: number,
  chunkSize = CHUNK_SIZE,
): Promise<ArrayBuffer> {
  const start = index * chunkSize;
  const end = Math.min(start + chunkSize, file.size);
  return file.slice(start, end).arrayBuffer();
}

/** Reassemble ordered chunk payloads into a Blob. */
export function assembleFile(
  chunks: Map<number, Uint8Array>,
  total: number,
  mimeType: string,
): Blob {
  const parts: BlobPart[] = [];
  for (let i = 0; i < total; i++) {
    const part = chunks.get(i);
    if (!part) {
      throw new Error(`Missing chunk ${i} of ${total}`);
    }
    parts.push(part);
  }
  return new Blob(parts, { type: mimeType });
}
