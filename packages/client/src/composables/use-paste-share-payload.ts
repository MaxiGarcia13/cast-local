import type { Ref } from 'vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { snapshotFiles } from '@/utils/snapshot-file';

export type PasteState = 'idle' | 'pasted' | 'empty' | 'failed';

const RESET_MS = 1500;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tagName = target.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
}

function normalizePastedFile(file: File): File {
  const hasName = file.name.trim().length > 0 && file.name !== 'image.png';
  if (hasName) {
    return file;
  }

  const extension = file.type === 'image/jpeg'
    ? 'jpg'
    : file.type === 'image/webp'
      ? 'webp'
      : file.type === 'image/gif'
        ? 'gif'
        : 'png';

  return new File([file], `pasted-image-${Date.now()}.${extension}`, {
    type: file.type || 'image/png',
    lastModified: file.lastModified || Date.now(),
  });
}

function collectClipboardFiles(clipboardData: DataTransfer): File[] {
  const fromItems: File[] = [];

  for (const item of clipboardData.items) {
    if (item.kind !== 'file') {
      continue;
    }
    const file = item.getAsFile();
    if (file) {
      fromItems.push(normalizePastedFile(file));
    }
  }

  if (fromItems.length > 0) {
    return fromItems;
  }

  return [...clipboardData.files].map(normalizePastedFile);
}

async function readClipboardPayload(): Promise<{ files: File[]; text: string }> {
  if (typeof navigator.clipboard?.read === 'function') {
    const items = await navigator.clipboard.read();
    const files: File[] = [];
    let text = '';

    for (const item of items) {
      const imageType = item.types.find((type) => type.startsWith('image/'));
      if (imageType) {
        const blob = await item.getType(imageType);
        files.push(normalizePastedFile(new File([blob], '', { type: imageType })));
        continue;
      }

      if (item.types.includes('text/plain')) {
        const blob = await item.getType('text/plain');
        text = await blob.text();
      }
    }

    return { files, text };
  }

  const text = await navigator.clipboard.readText();
  return { files: [], text };
}

export function usePasteSharePayload(files: Ref<File[]>, text: Ref<string>) {
  const pasteState = ref<PasteState>('idle');
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  function schedulePasteStateReset() {
    if (resetTimer !== undefined) {
      clearTimeout(resetTimer);
    }
    resetTimer = setTimeout(() => {
      pasteState.value = 'idle';
      resetTimer = undefined;
    }, RESET_MS);
  }

  async function applyPayload(pastedFiles: File[], pastedText: string): Promise<PasteState> {
    if (pastedFiles.length > 0) {
      const snapshots = await snapshotFiles(pastedFiles);
      files.value = [...files.value, ...snapshots];
      return 'pasted';
    }

    if (!pastedText) {
      return 'empty';
    }

    const current = text.value;
    text.value = current.trim().length > 0
      ? `${current}\n${pastedText}`
      : pastedText;
    return 'pasted';
  }

  async function onPaste(event: ClipboardEvent) {
    if (isEditableTarget(event.target)) {
      return;
    }

    const clipboardData = event.clipboardData;
    if (!clipboardData) {
      return;
    }

    const pastedFiles = collectClipboardFiles(clipboardData);
    if (pastedFiles.length > 0) {
      event.preventDefault();
      await applyPayload(pastedFiles, '');
      return;
    }

    const pastedText = clipboardData.getData('text/plain');
    if (!pastedText) {
      return;
    }

    event.preventDefault();
    await applyPayload([], pastedText);
  }

  async function pasteFromClipboard() {
    try {
      const payload = await readClipboardPayload();
      const nextState = await applyPayload(payload.files, payload.text);
      pasteState.value = nextState;
      schedulePasteStateReset();
    } catch {
      pasteState.value = 'failed';
      schedulePasteStateReset();
    }
  }

  function pasteLabel(idleLabel: string) {
    if (pasteState.value === 'pasted') {
      return 'Pasted';
    }
    if (pasteState.value === 'empty') {
      return 'Clipboard empty';
    }
    if (pasteState.value === 'failed') {
      return 'Paste failed';
    }
    return idleLabel;
  }

  onMounted(() => {
    window.addEventListener('paste', onPaste);
  });

  onUnmounted(() => {
    window.removeEventListener('paste', onPaste);
    if (resetTimer !== undefined) {
      clearTimeout(resetTimer);
    }
  });

  return { pasteFromClipboard, pasteState, pasteLabel };
}
