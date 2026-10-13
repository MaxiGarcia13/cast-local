const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

export function formatBytes(bytes: number): string {
  if (bytes <= 0) {
    return '0 B';
  }

  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    UNITS.length - 1,
  );
  const value = bytes / 1024 ** unitIndex;
  const rounded = value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1);

  return `${rounded} ${UNITS[unitIndex]}`;
}
