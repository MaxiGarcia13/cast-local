import type { FileMeta } from '@roomcast/shared';

export type SignalingStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface IncomingOffer {
  from: string;
  files: FileMeta[];
  textPreview: string | null;
}
