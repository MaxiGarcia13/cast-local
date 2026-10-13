const DEFAULT_PREVIEW_LENGTH = 80;

export function textPreview(text: string, maxLength = DEFAULT_PREVIEW_LENGTH): string | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}
