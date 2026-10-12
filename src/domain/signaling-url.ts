export const SIGNALING_PORT = 3001;

export function defaultSignalingUrl(): string {
  if (typeof window === 'undefined') {
    return `ws://localhost:${SIGNALING_PORT}`;
  }

  const hostname = window.location.hostname || 'localhost';
  return `ws://${hostname}:${SIGNALING_PORT}`;
}
