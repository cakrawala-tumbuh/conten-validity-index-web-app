/**
 * Next.js 16 Proxy untuk proteksi route.
 *
 * Menggantikan `middleware.ts` yang sudah deprecated di Next.js 16.
 * Memeriksa apakah pengguna sudah terautentikasi (via NextAuth JWT)
 * sebelum mengakses halaman dashboard. Redirect ke halaman login jika belum login.
 *
 * Proxy berjalan di edge runtime sehingga sangat cepat.
 *
 * @see https://nextjs.org/docs/messages/middleware-to-proxy
 */
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Fungsi proxy yang melindungi route dashboard dari akses tanpa autentikasi.
 *
 * Membaca JWT token dari cookie. Jika token tidak ada, redirect ke /login
 * dengan parameter `callbackUrl` agar pengguna diarahkan kembali setelah login.
 *
 * @param request - Incoming HTTP request dari Next.js.
 * @returns NextResponse redirect ke /login atau lanjut ke route berikutnya.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Konfigurasi route yang dilindungi oleh proxy.
 *
 * Semua route yang cocok dengan pola di bawah akan memerlukan autentikasi.
 * Halaman publik seperti `/login` dan asset statis tidak termasuk dalam matcher.
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
