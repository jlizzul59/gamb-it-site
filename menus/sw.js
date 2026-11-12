// Service worker de Think’n’Cook : fonctionne hors ligne et affiche les rappels.
const VERSION = "semainier-2026-11-12g";
const CORE = ["./", "index.html", "recettes.html", "recevoir.html", "recettes-plus.js?v=20261109b", "desserts.js?v=20261110a", "manifest.webmanifest", "tnc-icon-192.png", "tnc-icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith("/menus/")) return;
  const isPage = req.mode === "navigate" || /\.html$|\/$/.test(url.pathname);
  if (isPage) {
    // les pages : le réseau d'abord (pour avoir la dernière version), le cache si hors ligne
    e.respondWith(fetch(req, { cache: "no-cache" }).then((r) => { const cp = r.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("index.html"))));
  } else {
    e.respondWith(caches.match(req).then((hit) => {
      const net = fetch(req).then((r) => { if (r.ok) { const cp = r.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); } return r; }).catch(() => hit);
      return hit || net;
    }));
  }
});
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "Think’n’Cook", {
    body: d.body || "", icon: "tnc-icon-192.png", badge: "tnc-icon-192.png", tag: d.tag || undefined, data: { url: d.url || "/menus/index.html#aujourdhui" },
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || "/menus/", self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
    for (const c of cs) { if (c.url.startsWith(self.location.origin + "/menus/")) { c.navigate(target).catch(() => {}); return c.focus(); } }
    return self.clients.openWindow(target);
  }));
});
