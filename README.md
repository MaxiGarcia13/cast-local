# Roomcast

Peer-to-peer file and text transfer for devices on the same network — no cloud upload, no accounts, no waiting on a third-party relay for your bytes.

## The problem

Moving a file between your laptop and phone (or a teammate across the table) is still awkward:

- Cloud drives and chat apps upload to someone else's servers first
- USB cables and AirDrop only work in narrow setups
- Large files burn quota, sit in "processing," or never leave the LAN you already share

Roomcast solves that for the common case: **you're nearby, on the same Wi‑Fi (or LAN), and you just want the data to go from A to B.**

## What it does

1. **Pick what to share** — files and/or a short text note on the home screen
2. **Open a room** — you get a join link and QR code
3. **Invite a peer** — they open the link on another device on the network
4. **Send over the air** — after they accept, payload moves **peer-to-peer over WebRTC data channels**

The signaling server only helps peers find each other and exchange WebRTC handshake messages. **File and text contents travel device-to-device**, not through the server.

## How it works

```text
Host browser ──WebSocket /ws──► Fastify (rooms, offers, SDP/ICE)
     │
     └── WebRTC data channel ────► Guest browser
              (chunks + text)
```

| Piece                                | Role                                                  |
| ------------------------------------ | ----------------------------------------------------- |
| Vue + Vite SPA (`packages/client/`)  | Pick payload, host/join rooms, show transfer progress |
| Fastify + `ws` (`packages/server/`)  | HTTP (prod static) + signaling on `/ws`               |
| Shared protocol (`packages/shared/`) | Message types and signaling URL helpers               |
| WebRTC data channels                 | Actual file/text transfer between browsers            |

## Requirements

- Node.js (current LTS recommended)
- [pnpm](https://pnpm.io) 12.x (see `packageManager` in `package.json`)
- Modern browsers with WebRTC support
- Devices that can reach each other on the LAN (and both can reach the host running Roomcast)

## Quick start

```bash
pnpm install
pnpm dev
```

That starts:

- **Client** — Vite SPA (`--host`, proxies `/ws` → the server)
- **Server** — Fastify on port `3000` with WebSocket signaling at `/ws`

Open the printed local/LAN URL, share something, and join the room from the other device.

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

Render sets `PORT` for you. Clients connect with `wss://your-service.onrender.com/ws` automatically (same origin).

### Useful scripts

| Command            | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `pnpm dev`         | Client + server (Nx parallel)                        |
| `pnpm build`       | Build shared + client + server                       |
| `pnpm start`       | Production: `node packages/server/dist` + static SPA |
| `pnpm lint`        | ESLint                                               |
| `pnpm lint:fix`    | ESLint with autofix                                  |
| `pnpm release`     | Nx independent version + project changelogs          |
| `pnpm release:dry` | Dry-run release                                      |

Override the server listen port with `PORT` (default `3000`).

## Using it on a LAN

1. Run `pnpm dev` (or `pnpm build && pnpm start`) on a machine reachable by others.
2. On the host device, open the site via that machine's LAN IP (not only `localhost` if guests are other devices).
3. Share files/text → open the room → copy the join link or show the QR.
4. On the guest device, open the join URL and accept the transfer when offered.

The browser always uses same-origin `/ws` for signaling (`ws:` or `wss:` from the page URL).

## Project layout

```text
packages/client/  Vue 3 + Vite SPA (UI, Vue Router, PWA assets)
packages/server/  Fastify + WebSocket signaling
packages/shared/  P2P protocol types + signaling URL helpers
nx.json           Nx targets + independent release config
```

Each package has its own `package.json` and `CHANGELOG.md`. Versions are managed independently with `pnpm release` (conventional commits, e.g. `feat(client): …`).

## Privacy note

Roomcast is designed so **payloads stay on the peer path**. You choose which peer in the room receives the files or text — nothing is broadcast to everyone automatically. The signaling server sees room membership and control messages (who is offering what metadata, SDP/ICE), not the file bytes themselves. Still treat room links like a temporary capability: anyone who can join the room can see who's there and may be offered a transfer.

## License

ISC
