export function friendlyTransferError(error: unknown, fallback: string): string {
  if (typeof error === 'string' && error.trim()) {
    return humanizeTransferError(error);
  }

  if (error instanceof Error && error.message.trim()) {
    return humanizeTransferError(error.message);
  }

  return fallback;
}

function humanizeTransferError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('declined')) {
    return 'The other device declined the transfer.';
  }
  if (normalized.includes('data channel')) {
    return 'Could not open a private channel to the other device.';
  }
  if (normalized.includes('ice')) {
    return 'Network path failed. Stay on the same Wi‑Fi and try again.';
  }
  if (normalized.includes('offer') || normalized.includes('answer')) {
    return 'Could not start the connection. Try selecting the device again.';
  }
  if (normalized.includes('missing data')) {
    return 'A file arrived incomplete. Ask them to send again.';
  }
  if (normalized.includes('failed to connect') || normalized.includes('signaling')) {
    return 'Signaling server is unreachable.';
  }
  if (
    normalized.includes('could not be read')
    || normalized.includes('notreadable')
    || normalized.includes('permission problems')
  ) {
    return 'Could not re-read a selected file. Remove it and choose it again.';
  }

  return message;
}
