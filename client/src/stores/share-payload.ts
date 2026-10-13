import { atom, computed } from 'nanostores';

export interface SharePayload {
  files: File[];
  text: string;
}

const emptyPayload: SharePayload = {
  files: [],
  text: '',
};

export const sharePayloadStore = atom<SharePayload>(emptyPayload);

export const hasSharePayload = computed(sharePayloadStore, (payload) => {
  return payload.files.length > 0 || payload.text.trim().length > 0;
});

export function setSharePayload(files: File[], text: string) {
  sharePayloadStore.set({
    files: [...files],
    text,
  });
}

export function clearSharePayload() {
  sharePayloadStore.set({ ...emptyPayload });
}
