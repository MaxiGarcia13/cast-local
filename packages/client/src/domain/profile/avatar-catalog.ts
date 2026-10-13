import type { Component } from 'vue';
import { defineAsyncComponent } from 'vue';
import { pickRandomItem } from '@/utils/pick-random';

const AVATAR_COUNT = 105;

const avatarLoaders = import.meta.glob(
  '../../components/icons/avatars/peep-*.vue',
) as Record<string, () => Promise<{ default: Component }>>;

const avatarComponentById = new Map<string, Component>();

for (const [path, loader] of Object.entries(avatarLoaders)) {
  const match = /\/(peep-\d+)\.vue$/.exec(path);
  if (!match?.[1]) {
    continue;
  }
  avatarComponentById.set(match[1], defineAsyncComponent(loader));
}

export const AVATAR_IDS: string[] = Array.from(
  { length: AVATAR_COUNT },
  (_, index) => `peep-${index + 1}`,
);

export function isAvatarId(value: string): boolean {
  const match = /^peep-(\d+)$/.exec(value);
  if (!match) {
    return false;
  }
  const avatarNumber = Number(match[1]);
  return avatarNumber >= 1 && avatarNumber <= AVATAR_COUNT;
}

export function getAvatarComponent(avatarId: string): Component | undefined {
  if (!isAvatarId(avatarId)) {
    return undefined;
  }
  return avatarComponentById.get(avatarId);
}

export function pickRandomAvatarId(): string {
  return pickRandomItem(AVATAR_IDS);
}
