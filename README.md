# Cast Local

Peer-to-peer file and text transfer for devices on the same network — no cloud upload, no accounts, no waiting on a third-party relay for your bytes.

## The problem

Moving a file between your laptop and phone (or a teammate across the table) is still awkward:

- Cloud drives and chat apps upload to someone else's servers first
- USB cables and AirDrop only work in narrow setups
- Large files burn quota, sit in "processing," or never leave the LAN you already share

Cast Local solves that for the common case: **you're nearby, on the same Wi‑Fi (or LAN), and you just want the data to go from A to B.**

## What it does

1. **Pick what to share** — files and/or a short text note on the home screen
2. **Open a room** — you get a join link and QR code
3. **Invite a peer** — they open the link on another device on the network
4. **Send over the air** — after they accept, payload moves **peer-to-peer over WebRTC data channels**

The signaling server only helps peers find each other and exchange WebRTC handshake messages. **File and text contents travel device-to-device**, not through the server.

## How it works

```text
Host browser ──WebSocket──► Signaling server (rooms, offers, SDP/ICE)
     │                              │
     │◄───────WebSocket─────────────┘
     │
     └── WebRTC data channel ────► Guest browser
              (chunks + text)
```

| Piece                                | Role                                                       |
| ------------------------------------ | ---------------------------------------------------------- |
| Astro + Vue UI                       | Pick payload, host/join rooms, show transfer progress      |
| Signaling server (`ws`, port `3001`) | Rooms, peer presence, transfer offers, RTC signaling relay |
| WebRTC data channels                 | Actual file/text transfer between browsers                 |

## Requirements

- Node.js (current LTS recommended)
- [pnpm](https://pnpm.io) 12.x (see `packageManager` in `package.json`)
- Modern browsers with WebRTC support
- Devices that can reach each other on the LAN (and both can reach the host running Cast Local)

## Quick start

```bash
pnpm install
pnpm dev
```

That starts:

- **Web app** — Astro on the usual Vite/Astro port (bound with `--host` so phones on the LAN can open it)
- **Signaling** — WebSocket server on port `3001`

Then open the printed local/LAN URL on your machines, share something, and join the room from the other device.

### Production

```bash
pnpm build
pnpm start
```

`start` runs the built Node server (`dist/server/entry.mjs` on `HOST=0.0.0.0`) plus signaling on port `3001`.

### Useful scripts

| Command             | Description                               |
| ------------------- | ----------------------------------------- |
| `pnpm dev`          | Web + signaling together (development)    |
| `pnpm dev:web`      | Astro only                                |
| `pnpm dev:server`   | Signaling only                            |
| `pnpm build`        | Production build                          |
| `pnpm start`        | Built web + signaling (production)        |
| `pnpm start:web`    | Built web only                            |
| `pnpm start:server` | Signaling only (same as `dev:server`)     |
| `pnpm preview`      | Astro preview of the build (no signaling) |
| `pnpm lint`         | ESLint                                    |
| `pnpm lint:fix`     | ESLint with autofix                       |

Override the web port with `PORT` (Astro default `4321`) and signaling with `SIGNALING_PORT` (default `3001`).

## Using it on a LAN

1. Run `pnpm dev` on a machine reachable by others (same Wi‑Fi / network).
2. On the host device, open the site via that machine's LAN IP (not only `localhost` if guests are other devices).
3. Share files/text → open the room → copy the join link or show the QR.
4. On the guest device, open the join URL and accept the transfer when offered.

Signaling connects to `ws://<same-hostname>:3001`, so the hostname you use for the web app should also resolve for WebSocket access.

## Project layout

```text
src/
  components/     UI (home picker, room panels, transfer progress)
  composables/    Signaling, WebRTC, and transfer orchestration
  domain/p2p/     Shared protocol, chunking, signaling URL helpers
  pages/          Astro routes (`/`, `/room/[id]`, `/room/[id]/join`)
  stores/         In-memory share payload between home → room
server/           WebSocket signaling (rooms + message relay)
public/           Static assets, PWA bits
```

## Privacy note

Cast Local is designed so **payloads stay on the peer path**. You choose which peer in the room receives the files or text — nothing is broadcast to everyone automatically. The signaling server sees room membership and control messages (who is offering what metadata, SDP/ICE), not the file bytes themselves. Still treat room links like a temporary capability: anyone who can join the room can see who's there and may be offered a transfer.

## License

ISC
