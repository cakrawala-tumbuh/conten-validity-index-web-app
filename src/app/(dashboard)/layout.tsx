/**
 * Layout untuk halaman dashboard CVI Web App.
 *
 * Menyediakan struktur halaman responsif dengan sidebar navigasi
 * (drawer di mobile, statis di desktop) dan konten utama. Mengambil session
 * untuk menampilkan navigasi yang sesuai dengan role pengguna.
 */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardShell } from "@/components/features/layout/DashboardShell";
import type { ReactNode } from "react";

/**
 * Props untuk DashboardLayout.
 */
interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Layout utama dashboard — Server Component.
 *
 * Memeriksa session dan redirect ke login jika tidak terautentikasi.
 * Mendelegasikan rendering navigasi responsif ke `DashboardShell`.
 *
 * @param props.children - Konten halaman yang sedang aktif.
 * @returns Layout dashboard dengan sidebar, header, dan konten.
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.error) {
    redirect("/login");
  }

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
