import type { InjectionKey } from 'vue';
import { inject } from 'vue';

export type OpenProfileDialog = () => void;

export const OPEN_PROFILE_DIALOG_KEY: InjectionKey<OpenProfileDialog> = Symbol('openProfileDialog');

export function useOpenProfileDialog(): OpenProfileDialog {
  return inject(OPEN_PROFILE_DIALOG_KEY, () => {});
}
