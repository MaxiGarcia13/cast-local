import type { Ref } from 'vue';
import { nextTick, watch } from 'vue';

interface UseScrollIntoViewOptions {
  target: Ref<HTMLElement | null>;
  sources: Array<Ref<unknown> | (() => unknown)>;
  shouldScroll: () => boolean;
}

export function useScrollIntoView(options: UseScrollIntoViewOptions) {
  async function scrollToTarget() {
    await nextTick();
    options.target.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  watch(
    options.sources,
    () => {
      if (!options.shouldScroll()) {
        return;
      }
      void scrollToTarget();
    },
  );
}
