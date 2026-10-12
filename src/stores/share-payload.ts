import { atom, computed } from 'nanostores';

export interface SharePayload {
  files: File[];
  text: string;
  isHost: boolean;
}

const emptyPayload: SharePayload = {
  files: [],
  text: '',
  isHost: false,
};

export const sharePayloadStore = atom<SharePayload>(emptyPayload);

export const hasSharePayload = computed(sharePayloadStore, (payload) => {
  return payload.files.length > 0 || payload.text.trim().length > 0;
});

export function setSharePayload(payload: SharePayload) {
  sharePayloadStore.set({
    files: [...payload.files],
    text: payload.text,
    isHost: payload.isHost,
  });
}

export function setHostSharePayload(files: File[], text: string) {
  setSharePayload({
    files,
    text,
    isHost: true,
  });
}

export function setGuestSharePayload() {
  setSharePayload({
    files: [],
    text: '',
    isHost: false,
  });
}

export function clearSharePayload() {
  sharePayloadStore.set({ ...emptyPayload });
}
