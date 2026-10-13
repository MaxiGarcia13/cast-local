import { pickRandomItem } from '@/utils/pick-random';

export interface UserColor {
  id: string;
  hex: string;
  label: string;
}

export const USER_COLORS: UserColor[] = [
  { id: 'signal', hex: '#ff7a1a', label: 'Signal' },
  { id: 'coral', hex: '#ff9a3c', label: 'Coral' },
  { id: 'mist', hex: '#9aa8c7', label: 'Mist' },
  { id: 'fog', hex: '#ffffff', label: 'Fog' },
  { id: 'sky', hex: '#5b8def', label: 'Sky' },
  { id: 'lime', hex: '#7dce82', label: 'Lime' },
];

function getUserColorById(colorId: string): UserColor | undefined {
  return USER_COLORS.find((color) => color.id === colorId);
}

export function getUserColorHex(colorId: string): string {
  return getUserColorById(colorId)?.hex ?? USER_COLORS[0]?.hex ?? '#ff7a1a';
}

export function isUserColorId(colorId: string): boolean {
  return USER_COLORS.some((color) => color.id === colorId);
}

export function pickRandomColorId(): string {
  return pickRandomItem(USER_COLORS).id;
}
