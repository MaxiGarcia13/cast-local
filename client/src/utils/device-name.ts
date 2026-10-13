export function guessDeviceName(): string {
  if (typeof navigator === 'undefined') {
    return 'This device';
  }

  const platform = navigator.platform || 'Device';
  return platform.slice(0, 24);
}

export function guessDeviceType(): string {
  if (typeof navigator === 'undefined') {
    return 'unknown';
  }

  const userAgent = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod|android.*mobile/.test(userAgent)) {
    return 'mobile';
  }
  if (/android|tablet/.test(userAgent)) {
    return 'tablet';
  }
  return 'desktop';
}
