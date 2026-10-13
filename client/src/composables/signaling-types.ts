import type { FileMeta } from '@cast-local/shared';

export type SignalingStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface IncomingOffer {
  from: string;
  files: FileMeta[];
  textPreview: string | null;
}
