const CACHE = "lifestyle-v7";

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll([
        "/manifest.json",
        "/icons/icon-192.png",
        "/icons/icon-512.png"
      ]).catch(function () {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var request = event.request;

  // Skip non-GET and API
  if (request.method !== "GET") return;
  if (request.url.indexOf("/api/") !== -1) return;
  if (request.url.indexOf("chrome-extension") !== -1) return;

  // For navigation (page loads) — ALWAYS network first
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(function (response) {
        // Cache the page
        var clone = response.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put(request, clone).catch(function () {});
        });
        return response;
      }).catch(function () {
        // Offline — try cache, then show offline message
        return caches.match(request).then(function (cached) {
          if (cached) return cached;
          return new Response(
            '<!DOCTYPE html><html dir="rtl" lang="fa"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>آفلاین</title><style>*{margin:0;font-family:system-ui,sans-serif}body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f1f5f9;text-align:center;padding:2rem}h1{font-size:1.2rem;color:#334155;margin-bottom:.5rem}p{color:#94a3b8;font-size:.9rem;margin-bottom:1.5rem}button{background:#4F46E5;color:#fff;border:none;padding:.7rem 2rem;border-radius:12px;cursor:pointer;font-size:.9rem}</style></head><body><div><h1>اتصال اینترنت قطع شده</h1><p>لطفاً اتصال خود را بررسی کنید</p><button onclick="location.reload()">تلاش مجدد</button></div></body></html>',
            { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
          );
        });
      })
    );
    return;
  }

  // For static assets — cache first, then network
  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(request, clone).catch(function () {});
          });
        }
        return response;
      }).catch(function () {
        return new Response("", { status: 408 });
      });
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then(function (clients) {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        self.clients.openWindow("/");
      }
    })
  );
});
