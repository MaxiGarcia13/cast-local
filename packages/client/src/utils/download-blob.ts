let lastObjectUrl: string | null = null;

export function downloadBlob(blob: Blob, filename: string) {
  if (lastObjectUrl) {
    URL.revokeObjectURL(lastObjectUrl);
    lastObjectUrl = null;
  }

  const objectUrl = URL.createObjectURL(blob);
  lastObjectUrl = objectUrl;

  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}
