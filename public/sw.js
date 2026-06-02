/**
 * Service Worker untuk CVI Web App (PWA).
 *
 * Menyediakan kemampuan install (offline-capable) dengan strategi caching:
 * - Aset statis (ikon, manifest, favicon) di-cache saat instalasi (precache).
 * - Permintaan navigasi memakai strategi network-first dengan fallback cache,
 *   sehingga aplikasi tetap dapat dibuka meski koneksi terputus.
 * - Permintaan API (mengandung "/api/") TIDAK pernah di-cache agar data selalu segar.
 *
 * Catatan: file ini disajikan sebagai aset statis dari `public/` sehingga
 * di-load oleh browser pada scope root ("/").
 */

/** Versi cache — naikkan saat aset precache berubah agar cache lama dibersihkan. */
const CACHE_VERSION = "cvi-cache-v1";

/** Daftar aset inti yang di-precache saat service worker diinstal. */
const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

/**
 * Event "install": precache aset inti lalu aktif segera.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

/**
 * Event "activate": hapus cache versi lama lalu kuasai semua klien.
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

/**
 * Event "fetch": atur strategi pengambilan sumber daya.
 *
 * - Hanya menangani permintaan GET dengan skema http/https.
 * - Permintaan API dilewati (selalu ke jaringan, tanpa cache).
 * - Navigasi memakai network-first dengan fallback ke cache "/".
 * - Aset lain memakai cache-first dengan pembaruan di latar belakang.
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || !request.url.startsWith("http")) {
    return;
  }

  const url = new URL(request.url);

  // Jangan cache panggilan API — data harus selalu segar.
  if (url.pathname.includes("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => cached || caches.match("/")),
      ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
