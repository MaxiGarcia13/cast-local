import type { Server } from 'node:http';
import { WebSocketServer } from 'ws';
import { SIGNALING_PATH } from '@/domain/p2p';
import { handleClientMessage } from './handle-message';
import { removePeer } from './peer-registry';

export function attachSignaling(server: Server): WebSocketServer {
  const webSocketServer = new WebSocketServer({ server, path: SIGNALING_PATH });

  // `ws` re-emits HTTP server listen errors; the HTTP server owns handling them.
  webSocketServer.on('error', () => {});

  webSocketServer.on('connection', (ws) => {
    let peerId: string | null = null;

    ws.on('message', (raw) => {
      peerId = handleClientMessage(ws, peerId, raw);
    });

    ws.on('close', () => {
      if (peerId) {
        removePeer(peerId);
      }
    });

    ws.on('error', () => {
      if (peerId) {
        removePeer(peerId);
      }
    });
  });

  return webSocketServer;
}
