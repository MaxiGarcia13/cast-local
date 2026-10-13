export function formatReadySummary(options: {
  isHost: boolean;
  fileCount: number;
  text: string;
}): string {
  if (!options.isHost) {
    return 'Waiting for a transfer…';
  }

  const parts: string[] = [];
  if (options.fileCount === 1) {
    parts.push('1 file');
  } else if (options.fileCount > 1) {
    parts.push(`${options.fileCount} files`);
  }
  if (options.text.trim()) {
    parts.push('text');
  }

  return parts.length ? `${parts.join(' + ')} ready` : 'No files or text loaded';
}
