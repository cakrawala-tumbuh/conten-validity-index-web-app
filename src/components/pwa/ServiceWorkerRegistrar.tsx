/**
 * Komponen pendaftar Service Worker untuk PWA.
 *
 * Mendaftarkan `/sw.js` pada `window.load` agar aplikasi memenuhi syarat
 * installability (Add to Home Screen) dan mendukung mode offline dasar.
 * Komponen ini tidak merender UI apa pun.
 */
"use client";

import { useEffect } from "react";

/**
 * Mendaftarkan service worker ke browser jika didukung.
 *
 * Pendaftaran dilewati di lingkungan yang tidak mendukung `serviceWorker`
 * (mis. saat unit test di jsdom atau peramban lama). Kegagalan pendaftaran
 * ditangani secara diam-diam agar tidak mengganggu render aplikasi.
 *
 * @returns `null` — komponen ini hanya menjalankan efek samping.
 *
 * @example
 * ```tsx
 * <ServiceWorkerRegistrar />
 * ```
 */
export const ServiceWorkerRegistrar = (): null => {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    /**
     * Melakukan pendaftaran service worker `/sw.js`.
     */
    const register = async (): Promise<void> => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (error) {
        console.error("Gagal mendaftarkan service worker:", error);
      }
    };

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
};
