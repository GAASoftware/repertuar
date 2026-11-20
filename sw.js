// StagePal Repertoire – offline
const C = "repertuar-2026-11-20b";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("repertuar-") && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if(u.origin !== self.location.origin) return;
  // the page itself: network first, so a new version shows on the next open; the cache only when offline
  if(e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(r => { if(r && r.ok) caches.open(C).then(c => c.put("./index.html", r.clone())); return r; })
      .catch(() => caches.open(C).then(c => c.match("./index.html"))));
    return;
  }
  e.respondWith(caches.open(C).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true }) || (e.request.mode === "navigate" ? await c.match("./index.html") : null);
    const net = fetch(e.request).then(r => { if(r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
