import { createServer } from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { SIGNALING_PATH } from '@/domain/p2p';
import { attachSignaling } from './attach-signaling';
import { lanAddresses } from './lan-addresses';

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT) || 4321;
const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist/client');

const { handler: ssrHandler } = await import('../dist/server/entry.mjs');

const app = express();
app.use(express.static(clientRoot));
app.use(ssrHandler);

const server = createServer(app);
attachSignaling(server);

server.on('error', (error) => {
  const message = error instanceof Error ? error.message : String(error);
  // eslint-disable-next-line no-console -- startup failure
  console.error(`[server] ${message}`);
  if ('code' in error && error.code === 'EADDRINUSE') {
    // eslint-disable-next-line no-console -- startup failure
    console.error(`[server] port ${port} is already in use`);
  }
  process.exit(1);
});

server.listen(port, host, () => {
  // eslint-disable-next-line no-console -- server startup banner
  console.info(`[web] http://${host}:${port}`);
  // eslint-disable-next-line no-console -- server startup banner
  console.info(`[signaling] ws://${host}:${port}${SIGNALING_PATH}`);
  for (const address of lanAddresses()) {
    // eslint-disable-next-line no-console -- server startup banner
    console.info(`[web] LAN  http://${address}:${port}`);
    // eslint-disable-next-line no-console -- server startup banner
    console.info(`[signaling] LAN  ws://${address}:${port}${SIGNALING_PATH}`);
  }
});
