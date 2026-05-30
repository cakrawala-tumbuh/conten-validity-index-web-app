/**
 * Next.js Middleware untuk proteksi route.
 *
 * Memeriksa apakah pengguna sudah terautentikasi sebelum mengakses
 * halaman dashboard. Redirect ke halaman login jika belum login.
 *
 * Middleware berjalan di edge runtime sehingga sangat cepat.
 */
export { default } from "next-auth/middleware";

/**
 * Konfigurasi route yang dilindungi oleh middleware.
 *
 * Semua route yang cocok dengan pola di bawah akan memerlukan autentikasi.
 * Halaman publik seperti `/login` tidak termasuk dalam matcher.
 */
export const config = {
  matcher: [
    "/",
    "/instruments/:path*",
    "/my-assignments/:path*",
    "/users/:path*",
    "/activity-logs/:path*",
    "/reports/:path*",
  ],
};
