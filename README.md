# Roomcast

LAN-first peer-to-peer file and text sharing. A small signaling server helps peers find each other; after that, payloads move over WebRTC data channels between browsers — not uploaded as a cloud file store.

## The problem

Moving a file between your laptop and phone (or a teammate across the table) is still awkward:

- Cloud drives and chat apps upload to someone else's servers first
- USB cables and AirDrop only work in narrow setups
- Large files burn quota, sit in "processing," or never leave the LAN you already share

Roomcast targets the common case: **you're nearby, on the same Wi‑Fi (or LAN), and you just want the data to go from A to B.**

## What it does

1. **Upload files** — drop/browse files, paste from the clipboard, and/or add a short text note
2. **Share** — opens a room with a short join code, link, and QR
3. **Join a room** — guests use **Join room** (`/join`) with a code or invite link, or open the link/QR directly
4. **Send over the air** — pick a peer in the room; after they accept, the payload moves **peer-to-peer over WebRTC data channels**

You can set a local display name, color, and avatar (stored in the browser). No accounts.

The signaling server exchanges room presence and WebRTC handshake messages (SDP/ICE). **File and text contents travel on the data channel**, not through the signaling host. ICE uses a public STUN server for connectivity checks; there is no TURN media relay in the default setup, so same-LAN (or otherwise directly reachable) peers work best.

## How it works

```text
Host browser ──WebSocket /ws──► Fastify (rooms, offers, SDP/ICE)
     │
     └── WebRTC data channel ────► Guest browser
              (chunks + text)
```

| Piece                                | Role                                                  |
| ------------------------------------ | ----------------------------------------------------- |
| Vue + Vite SPA (`packages/client/`)  | Pick payload, host/join rooms, transfer UI             |
| Fastify + `ws` (`packages/server/`)  | HTTP (prod static) + signaling on `/ws`               |
| Shared protocol (`packages/shared/`) | Message types and signaling URL helpers               |
| WebRTC data channels                 | Actual file/text transfer between browsers            |

### Routes

| Path              | Role                                      |
| ----------------- | ----------------------------------------- |
| `/`               | Upload files / compose text → Share       |
| `/join`           | Enter a room code or paste an invite link |
| `/room/:id`       | Host room                                 |
| `/room/:id/join`  | Guest room                                |

## Requirements

- Node.js (current LTS recommended)
- [pnpm](https://pnpm.io) 12.x (see `packageManager` in `package.json`)
- Modern browsers with WebRTC support
- Devices that can reach each other (ideally the same LAN), and both can reach the host running Roomcast

## Quick start

```bash
pnpm install
pnpm dev:server   # Fastify on :3000, WebSocket at /ws
pnpm dev:client   # Vite SPA (--host), proxies /ws → the server
```

Run those in two terminals (or your preferred process runner). Open the printed local/LAN URL, share something, and join from the other device via the link, QR, or `/join`.

### Production

```bash
pnpm build
pnpm start
```

`build` compiles **shared**, **client**, and **server**. `start` runs the built server with plain `node` (`packages/server/dist/index.js`), serving `packages/client/dist` and `/ws` on `HOST` / `PORT` (defaults `0.0.0.0` / `3000`).

### Deploy on Render

Create a **Web Service**:

| Setting       | Value        |
| ------------- | ------------ |
| Build command | `pnpm build` |
| Start command | `pnpm start` |

Render sets `PORT` for you. Clients connect with `wss://your-service.onrender.com/ws` automatically (same origin). Cross-network transfers still depend on WebRTC reaching a direct path (STUN only — no TURN by default).

### Useful scripts

| Command            | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `pnpm dev:client`  | Vite SPA (`--host`), proxies `/ws`                   |
| `pnpm dev:server`  | Fastify + signaling on `/ws`                         |
| `pnpm build`       | Build shared + client + server                       |
| `pnpm start`       | Production: `node packages/server/dist` + static SPA |
| `pnpm lint`        | ESLint                                               |
| `pnpm lint:fix`    | ESLint with autofix                                  |
| `pnpm release`     | Nx independent version + project changelogs          |
| `pnpm release:dry` | Dry-run release                                      |

Override the server listen port with `PORT` (default `3000`).

## Using it on a LAN

1. Run `pnpm dev:server` and `pnpm dev:client` (or `pnpm build && pnpm start`) on a machine reachable by others.
2. On the host device, open the site via that machine's LAN IP (not only `localhost` if guests are other devices).
3. On **Upload files**, add files/text → **Share** → copy the join link or show the QR.
4. On the guest device, open the join URL, or go to **Join room** and enter the short room code / paste the invite link, then accept the transfer when offered.

The browser always uses same-origin `/ws` for signaling (`ws:` or `wss:` from the page URL).

## Project layout

```text
packages/client/  Vue 3 + Vite SPA (UI, Vue Router, Tailwind v4)
packages/server/  Fastify + WebSocket signaling
packages/shared/  P2P protocol types + signaling URL helpers
nx.json           Nx targets + independent release config
```

Each package has its own `package.json` and `CHANGELOG.md`. Versions are managed independently with `pnpm release` (conventional commits, e.g. `feat(client): …`).

## Privacy note

Roomcast is designed so **payloads stay on the peer path**. You choose which peer in the room receives the files or text — nothing is broadcast to everyone automatically. The signaling server sees room membership and control messages (who is offering what metadata, SDP/ICE), not the file bytes themselves. ICE may contact a public STUN server for connectivity checks. Still treat room links like a temporary capability: anyone who can join the room can see who's there and may be offered a transfer.

## License

ISC
