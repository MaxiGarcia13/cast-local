import type { FileMeta } from '@roomcast/shared';
import { friendlyTransferError } from '@/utils/transfer-errors';

export type TransferPhase
  = | 'idle'
    | 'sending'
    | 'receiving'
    | 'complete'
    | 'error';

export interface TransferProgress {
  phase: TransferPhase;
  bytesDone: number;
  bytesTotal: number;
  filesDone: number;
  filesTotal: number;
  currentFileName: string | null;
  completedFiles: string[];
  receivedText: string | null;
  error: string | null;
}

export interface SendPayload {
  files: File[];
  fileMetas: FileMeta[];
  text: string | null;
}

export function createIdleProgress(): TransferProgress {
  return {
    phase: 'idle',
    bytesDone: 0,
    bytesTotal: 0,
    filesDone: 0,
    filesTotal: 0,
    currentFileName: null,
    completedFiles: [],
    receivedText: null,
    error: null,
  };
}

export function applyTransferError(
  progress: TransferProgress,
  error: unknown,
  fallback = 'Transfer failed',
): TransferProgress {
  return {
    ...progress,
    phase: 'error',
    error: friendlyTransferError(error, fallback),
    currentFileName: null,
  };
}
