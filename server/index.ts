import process from 'node:process';
import { WebSocketServer } from 'ws';
import { SIGNALING_PORT } from '../src/domain/signaling-url';
import { handleClientMessage } from './handle-message';
import { lanAddresses } from './lan-addresses';
import { removePeer } from './peer-registry';

const PORT = Number(process.env.SIGNALING_PORT) || SIGNALING_PORT;

const wss = new WebSocketServer({ host: '0.0.0.0', port: PORT });

wss.on('connection', (ws) => {
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

// eslint-disable-next-line no-console -- server startup banner
console.info(`[signaling] listening on ws://0.0.0.0:${PORT}`);
for (const address of lanAddresses()) {
  // eslint-disable-next-line no-console -- server startup banner
  console.info(`[signaling] LAN  ws://${address}:${PORT}`);
}
