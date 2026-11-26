// Service worker: works offline and opens instantly after the first visit.
// - App files: served from cache, refreshed in the background (stale-while-revalidate).
// - Pictures (assets/): cache-first; a picture is stored the first time it is opened.
// Bump APP_VERSION when app code changes, ART_VERSION after re-running tools/build.html or changing
// pictures, so installed devices fetch the new files (pictures are not re-downloaded for code changes).
const APP_VERSION = "2", ART_VERSION = "1";
const SHELL = `bvv-shell-v${APP_VERSION}`, ART = `bvv-art-v${ART_VERSION}`;
const SHELL_FILES = ["./", "index.html", "styles.css", "app.js", "src/pages.js", "data/drawings.js", "manifest.webmanifest",
  "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/icons/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const shell = await caches.open(SHELL);
    await shell.addAll(SHELL_FILES);
    // Thumbnails are small (~10 KB each): cache them all so the gallery works offline.
    try {
      // (import() is not allowed in service workers, so read the ids out of the catalogue text)
      const text = await (await caches.match("data/drawings.js")).text();
      const ids = [...text.matchAll(/"id":"([^"]+)"/g)].map((m) => m[1]);
      const art = await caches.open(ART);
      await art.addAll(ids.map((id) => `assets/thumbs/${id}.webp`));
    } catch {}
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith("bvv-") && key !== SHELL && key !== ART) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.includes("/assets/")) {
    e.respondWith(caches.open(ART).then(async (cache) => {
      const hit = await cache.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    }));
    return;
  }
  e.respondWith(caches.open(SHELL).then(async (cache) => {
    const hit = await cache.match(e.request, { ignoreSearch: e.request.mode === "navigate" });
    const fresh = fetch(e.request).then((res) => { if (res.ok) cache.put(e.request, res.clone()); return res; }).catch(() => hit);
    return hit || fresh;
  }));
});
