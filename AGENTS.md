# AGENTS.md

Guidance for coding agents working in **Cast Local**.

## Product

Cast Local is a LAN peer-to-peer file/text transfer app. Users pick a payload, open a room (link + QR), a guest joins, accepts a transfer offer, then bytes move over **WebRTC data channels**. The WebSocket server is **signaling only** (rooms, presence, offers, SDP/ICE relay) — not a file store or relay for payload bytes.

Keep that boundary: do not route file/text contents through the signaling server.

## Commands

```bash
pnpm install
pnpm dev          # Astro (--host) + signaling
pnpm dev:web      # UI only
pnpm dev:server   # signaling only (default port 3001)
pnpm build
pnpm start        # production: dist/server/entry.mjs + signaling
pnpm start:web    # built web only (HOST=0.0.0.0)
pnpm lint
pnpm lint:fix
```

Package manager is **pnpm** (see `packageManager` in `package.json`). Prefer it over npm/yarn.

## Repository map

| Path               | Responsibility                                       |
| ------------------ | ---------------------------------------------------- |
| `src/pages/`       | Astro routes; keep thin, mount Vue apps              |
| `src/components/`  | Vue UI (home, room, icons)                           |
| `src/composables/` | Signaling socket, RTC, transfer orchestration        |
| `src/domain/p2p/`  | Shared types/protocol used by **browser and server** |
| `src/stores/`      | Client share payload (home → room)                   |
| `src/utils/`       | Pure helpers (room id, bytes, downloads, …)          |
| `server/`          | WebSocket signaling (`ws`), room/peer registries     |
| `.cursor/rules/`   | Project coding rules (naming, modules, UI spacing)   |

Import alias: `@/` → `src/`.

## Architecture rules

1. **Shared protocol lives in `src/domain/p2p/`**  
   Client and signaling message shapes (`ClientMessage`, `ServerMessage`, transfer manifest/control) must stay in sync. Change types here first, then call sites in `server/` and `src/composables/`.

2. **Signaling vs data path**
   - Signaling: join room, peer lists, `offer-transfer` / `accept` / `decline`, `rtc-offer` / `rtc-answer` / `ice-candidate`
   - Data channel: manifest, text, file chunks, completion/errors

3. **Rooms**  
   Host creates/opens a room; guests join an existing open room. Host disconnect closes the room for everyone (`room-closed`). Don't invent a second room model without updating `server/room-registry.ts` and the room UI.

4. **UI stack**  
   Astro for pages/layout; Vue 3 for interactive UI; Nanostores where shared client state already exists; Tailwind v4 + cast design tokens in `src/styles/global.css`.

## Out of scope / avoid

- Uploading user files to cloud storage or persisting them on the signaling host
- Broad refactors unrelated to the task
- Adding dependencies unless needed for the requested change
- Rewriting working P2P chunking/backpressure without a clear bug or requirement
