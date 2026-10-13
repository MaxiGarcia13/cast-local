/** Dev server port for Fastify (Vite proxies `/ws` here). */
export const SIGNALING_PORT = 3000;

/** Shared WebSocket path for local proxy, production, and Render. */
export const SIGNALING_PATH = '/ws';

export function defaultSignalingUrl(): string {
  if (typeof window === 'undefined') {
    return `ws://localhost:${SIGNALING_PORT}${SIGNALING_PATH}`;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host || `localhost:${SIGNALING_PORT}`;
  return `${protocol}//${host}${SIGNALING_PATH}`;
}
