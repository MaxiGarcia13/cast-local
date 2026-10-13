# AGENTS.md

Guidance for coding agents working in **Roomcast**.

## Product

Roomcast is a LAN peer-to-peer file/text transfer app. Users pick a payload, open a room (link + QR), a guest joins, accepts a transfer offer, then bytes move over **WebRTC data channels**. The WebSocket server is **signaling only** (rooms, presence, offers, SDP/ICE relay) — not a file store or relay for payload bytes.

Keep that boundary: do not route file/text contents through the signaling server.

## Commands

```bash
pnpm install
pnpm dev          # Vite client + Fastify server (parallel)
pnpm build        # shared + client + server → */dist
pnpm start        # production: node server/dist (serves client/dist + /ws)
pnpm lint
pnpm lint:fix
pnpm release      # nx release (independent package versions)
pnpm release:dry
```

Package manager is **pnpm** (see `packageManager` in `package.json`). Prefer it over npm/yarn.

## Repository map

| Path             | Responsibility                                        |
| ---------------- | ----------------------------------------------------- |
| `client/`        | Vue 3 + Vite SPA (`@/` → `client/src`)                |
| `server/`        | Fastify HTTP + `ws` signaling on `/ws`                |
| `shared/`        | `@roomcast/shared` protocol + signaling URL helpers |
| `.cursor/rules/` | Project coding rules (naming, modules, UI spacing)    |

## Architecture rules

1. **Shared protocol lives in `shared/`** (`@roomcast/shared`)  
   Client and signaling message shapes must stay in sync. Change types here first, then call sites in `server/` and `client/`.

2. **Signaling vs data path**
   - Signaling: join room, peer lists, `offer-transfer` / `accept` / `decline`, `rtc-offer` / `rtc-answer` / `ice-candidate`
   - Data channel: manifest, text, file chunks, completion/errors (chunk helpers live in `client/src/p2p/`)
   - Browser always connects to same-origin `SIGNALING_PATH` (`/ws`). Dev: Vite proxies `/ws` → Fastify `:3000`. Prod: same Fastify process.

3. **Rooms**  
   Host creates/opens a room; guests join an existing open room. Host disconnect closes the room for everyone (`room-closed`). Don't invent a second room model without updating `server/src/room-registry.ts` and the room UI.

4. **UI stack**  
   Vue 3 + Vue Router + Vite; Nanostores for share payload; Tailwind v4 + cast tokens in `client/src/styles/global.css`.

5. **Versioning**  
   Independent Nx release per package. Prefer scoped conventional commits: `feat(client):`, `fix(server):`, `feat(shared):`.

## Out of scope / avoid

- Uploading user files to cloud storage or persisting them on the signaling host
- Broad refactors unrelated to the task
- Adding dependencies unless needed for the requested change
- Rewriting working P2P chunking/backpressure without a clear bug or requirement
