/**
 * Helper fungsi untuk autentikasi server-side.
 *
 * Menyediakan fungsi untuk mengambil session, memeriksa role,
 * dan melindungi route dari akses yang tidak diizinkan.
 */
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { UserRole } from "@/types/user";

/**
 * Mengambil session pengguna yang sedang login dari server-side context.
 *
 * Shortcut untuk `getServerSession(authOptions)` agar tidak perlu mengimpor
 * `authOptions` berulang kali.
 *
 * @returns Session aktif atau `null` jika tidak ada.
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Mengambil session dan redirect ke halaman login jika tidak ada session.
 *
 * Digunakan di Server Components untuk melindungi halaman yang memerlukan auth.
 *
 * @returns Session yang dijamin ada (tidak null).
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Mengambil session dan redirect jika pengguna bukan admin.
 *
 * @returns Session pengguna dengan role admin.
 */
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "admin") {
    redirect("/");
  }
  return session;
}

/**
 * Memeriksa apakah role yang diberikan adalah admin.
 *
 * @param role - Role yang akan diperiksa.
 * @returns `true` jika role adalah admin.
 */
export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}

/**
 * Memeriksa apakah role yang diberikan adalah expert.
 *
 * @param role - Role yang akan diperiksa.
 * @returns `true` jika role adalah expert.
 */
export function isExpert(role: UserRole): boolean {
  return role === "expert";
}
