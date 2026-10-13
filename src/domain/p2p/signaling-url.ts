/** Dev-only standalone signaling port (proxied by Vite to same-origin `/ws`). */
export const SIGNALING_PORT = 3001;

/** Shared WebSocket path for local proxy, production, and Render. */
export const SIGNALING_PATH = '/ws';

export function defaultSignalingUrl(): string {
  if (typeof window === 'undefined') {
    return `ws://localhost:4321${SIGNALING_PATH}`;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host || 'localhost:4321';
  return `${protocol}//${host}${SIGNALING_PATH}`;
}
