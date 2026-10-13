# Changelog

## 0.0.0

- Initial Fastify server with WebSocket signaling on `/ws`
- Serves `client/dist` in production (SPA fallback)
- Production build via `tsc` → `dist/`; `start` runs `node dist/index.js`
