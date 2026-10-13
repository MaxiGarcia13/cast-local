export function formatPayloadParts(options: {
  fileCount: number;
  hasText: boolean;
}): string[] {
  const parts: string[] = [];
  if (options.fileCount === 1) {
    parts.push('1 file');
  } else if (options.fileCount > 1) {
    parts.push(`${options.fileCount} files`);
  }
  if (options.hasText) {
    parts.push('text');
  }
  return parts;
}

export function formatReadySummary(options: {
  isHost: boolean;
  fileCount: number;
  text: string;
}): string {
  if (!options.isHost) {
    return 'Waiting for a transfer…';
  }

  const parts = formatPayloadParts({
    fileCount: options.fileCount,
    hasText: Boolean(options.text.trim()),
  });

  return parts.length ? `${parts.join(' + ')} ready` : 'No files or text loaded';
}

export function formatOfferSummary(options: {
  fileCount: number;
  hasText: boolean;
}): string {
  const parts = formatPayloadParts(options);
  return parts.join(' and ') || 'a transfer';
}
