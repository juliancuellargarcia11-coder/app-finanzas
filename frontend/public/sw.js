// PinkBudget — service worker: app-shell cache with offline fallback.
// Cache version bumps on each release to invalidate old bundles.
const CACHE = "pinkbudget-v1";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => null),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

// Strategy:
//  - Navigation requests (HTML) -> network first, fallback to cached "/"
//  - Static assets (JS/CSS/img/font) -> stale-while-revalidate
//  - Everything else -> network only (no cache for /api/*)
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.pathname.startsWith("/api/")) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put("/", clone)).catch(() => null);
          return res;
        })
        .catch(() => caches.match("/").then((r) => r || Response.error())),
    );
    return;
  }

  const isAsset = /\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ttf|otf|json)$/i.test(
    url.pathname,
  );
  if (isAsset) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => null);
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
