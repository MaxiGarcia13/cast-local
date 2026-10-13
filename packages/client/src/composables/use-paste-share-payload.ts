import type { Ref } from 'vue';
import { onMounted, onUnmounted } from 'vue';
import { snapshotFiles } from '@/utils/snapshot-file';

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

export function usePasteSharePayload(files: Ref<File[]>, text: Ref<string>) {
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
      const snapshots = await snapshotFiles(pastedFiles);
      files.value = [...files.value, ...snapshots];
      return;
    }

    const pastedText = clipboardData.getData('text/plain');
    if (!pastedText) {
      return;
    }

    event.preventDefault();
    const current = text.value;
    text.value = current.trim().length > 0
      ? `${current}\n${pastedText}`
      : pastedText;
  }

  onMounted(() => {
    window.addEventListener('paste', onPaste);
  });

  onUnmounted(() => {
    window.removeEventListener('paste', onPaste);
  });
}
