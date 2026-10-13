import { onUnmounted, ref } from 'vue';

export type CopyState = 'idle' | 'copied' | 'failed';

const RESET_MS = 1500;

export function useCopyToClipboard() {
  const copyState = ref<CopyState>('idle');
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  onUnmounted(() => {
    if (resetTimer !== undefined) {
      clearTimeout(resetTimer);
    }
  });

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copyState.value = 'copied';
      if (resetTimer !== undefined) {
        clearTimeout(resetTimer);
      }
      resetTimer = setTimeout(() => {
        copyState.value = 'idle';
        resetTimer = undefined;
      }, RESET_MS);
    } catch {
      copyState.value = 'failed';
    }
  }

  function label(idleLabel: string) {
    if (copyState.value === 'copied') {
      return 'Copied';
    }
    if (copyState.value === 'failed') {
      return 'Copy failed';
    }
    return idleLabel;
  }

  return { copyState, copy, label };
}
