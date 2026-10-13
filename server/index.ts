import { createServer } from 'node:http';
import process from 'node:process';
import { SIGNALING_PATH, SIGNALING_PORT } from '@/domain/p2p';
import { attachSignaling } from './attach-signaling';
import { lanAddresses } from './lan-addresses';

const PORT = Number(process.env.SIGNALING_PORT) || SIGNALING_PORT;

const server = createServer((_request, response) => {
  response.writeHead(404);
  response.end();
});

attachSignaling(server);

server.on('error', (error) => {
  const message = error instanceof Error ? error.message : String(error);
  // eslint-disable-next-line no-console -- startup failure
  console.error(`[signaling] ${message}`);
  if ('code' in error && error.code === 'EADDRINUSE') {
    // eslint-disable-next-line no-console -- startup failure
    console.error(`[signaling] port ${PORT} is already in use — stop the other process or set SIGNALING_PORT`);
  }
  process.exit(1);
});

server.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console -- server startup banner
  console.info(`[signaling] listening on ws://0.0.0.0:${PORT}${SIGNALING_PATH}`);
  for (const address of lanAddresses()) {
    // eslint-disable-next-line no-console -- server startup banner
    console.info(`[signaling] LAN  ws://${address}:${PORT}${SIGNALING_PATH}`);
  }
});
