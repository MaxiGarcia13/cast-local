import type { FileMeta } from '@/domain/p2p';

export type SignalingStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface IncomingOffer {
  from: string;
  files: FileMeta[];
  textPreview: string | null;
}
