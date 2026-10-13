import { atom } from 'nanostores';
import { isAvatarId, pickRandomAvatarId } from '@/profile/avatar-catalog';
import { isUserColorId, pickRandomColorId } from '@/profile/user-colors';
import { guessDeviceName } from '@/utils/device-name';

export interface UserProfile {
  name: string;
  colorId: string;
  avatarId: string;
}

const STORAGE_KEY = 'roomcast.user-profile';

function createDefaultProfile(): UserProfile {
  return {
    name: guessDeviceName(),
    colorId: pickRandomColorId(),
    avatarId: pickRandomAvatarId(),
  };
}

function sanitizeProfile(value: unknown): UserProfile | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<UserProfile>;
  const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
  const colorId = typeof candidate.colorId === 'string' ? candidate.colorId : '';
  const avatarId = typeof candidate.avatarId === 'string' ? candidate.avatarId : '';

  if (!name || !isUserColorId(colorId) || !isAvatarId(avatarId)) {
    return null;
  }

  return {
    name: name.slice(0, 24),
    colorId,
    avatarId,
  };
}

function readStoredProfile(): UserProfile | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return sanitizeProfile(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeStoredProfile(profile: UserProfile) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

function loadOrCreateProfile(): UserProfile {
  const stored = readStoredProfile();
  if (stored) {
    return stored;
  }

  const profile = createDefaultProfile();
  writeStoredProfile(profile);
  return profile;
}

export const userProfileStore = atom<UserProfile>(loadOrCreateProfile());

export function setUserProfile(partial: Partial<UserProfile>) {
  const current = userProfileStore.get();
  const next = sanitizeProfile({
    ...current,
    ...partial,
    name: partial.name ?? current.name,
  });

  if (!next) {
    return;
  }

  userProfileStore.set(next);
  writeStoredProfile(next);
}
