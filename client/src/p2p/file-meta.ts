import type { FileMeta } from '@cast-local/shared';

export function fileToMeta(file: File, id = crypto.randomUUID()): FileMeta {
  return {
    id,
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
  };
}
