import { pickRandomItem } from '@/utils/pick-random';

const AVATAR_COUNT = 105;

const avatarUrlByPath = import.meta.glob(
  '../components/icons/avatars/peep-*.svg',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
) as Record<string, string>;

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

export function getAvatarUrl(avatarId: string): string {
  if (!isAvatarId(avatarId)) {
    return '';
  }
  const pathSuffix = `/${avatarId}.svg`;
  const entry = Object.entries(avatarUrlByPath).find(([path]) => path.endsWith(pathSuffix));
  return entry?.[1] ?? '';
}

export function pickRandomAvatarId(): string {
  return pickRandomItem(AVATAR_IDS);
}
