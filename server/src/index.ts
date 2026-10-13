import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { SIGNALING_PATH, SIGNALING_PORT } from '@roomcast/shared';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import { attachSignaling } from './attach-signaling.js';
import { lanAddresses } from './lan-addresses.js';

const isProduction = process.env.NODE_ENV === 'production';
const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT) || SIGNALING_PORT;
const serverRoot = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(serverRoot, '../../client/dist');

async function main() {
  const app = Fastify({ logger: true });

  if (isProduction) {
    await app.register(fastifyStatic, {
      root: clientDist,
      wildcard: false,
    });

    app.setNotFoundHandler((request, reply) => {
      if (request.method === 'GET' || request.method === 'HEAD') {
        return reply.sendFile('index.html');
      }
      return reply.code(404).send({ message: 'Not found' });
    });
  } else {
    app.get('/health', async () => ({ ok: true }));
  }

  await app.ready();
  attachSignaling(app.server);

  try {
    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  app.log.info(`[web] http://${host}:${port}`);
  app.log.info(`[signaling] ws://${host}:${port}${SIGNALING_PATH}`);
  for (const address of lanAddresses()) {
    app.log.info(`[web] LAN  http://${address}:${port}`);
    app.log.info(`[signaling] LAN  ws://${address}:${port}${SIGNALING_PATH}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
