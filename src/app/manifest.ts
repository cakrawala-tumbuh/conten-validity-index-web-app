/**
 * Web App Manifest untuk CVI Web App (PWA).
 *
 * Next.js akan menyajikan file ini di `/manifest.webmanifest` dan menautkannya
 * secara otomatis pada setiap halaman. Manifest membuat aplikasi dapat
 * diinstal (Add to Home Screen) dengan nama, ikon, dan tampilan standalone.
 *
 * Nama aplikasi, ikon, warna tema, dan deskripsi diambil dari konstanta
 * branding (`src/constants`) sehingga mudah diganti melalui environment
 * variable tanpa mengubah kode.
 */
import type { MetadataRoute } from "next";
import {
  APP_BACKGROUND_COLOR,
  APP_DESCRIPTION,
  APP_NAME,
  APP_SHORT_NAME,
  APP_THEME_COLOR,
} from "@/constants";

/**
 * Menghasilkan web app manifest untuk PWA.
 *
 * @returns Objek manifest sesuai standar W3C Web App Manifest.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_SHORT_NAME,
    description: APP_DESCRIPTION,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: APP_BACKGROUND_COLOR,
    theme_color: APP_THEME_COLOR,
    lang: "id",
    dir: "ltr",
    categories: ["productivity", "education"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
