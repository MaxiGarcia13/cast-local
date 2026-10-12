globalThis.addEventListener('install', (event) => {
  event.waitUntil(globalThis.skipWaiting());
});

globalThis.addEventListener('activate', (event) => {
  event.waitUntil(globalThis.clients.claim());
});

// Required for Chromium install prompts; network-only so local signaling stays fresh.
globalThis.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
