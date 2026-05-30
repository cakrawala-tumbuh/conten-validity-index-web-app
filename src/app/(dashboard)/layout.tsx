/**
 * Layout untuk halaman dashboard CVI Web App.
 *
 * Menyediakan struktur halaman dengan sidebar navigasi di kiri
 * dan konten utama di kanan. Mengambil session untuk menampilkan
 * navigasi yang sesuai dengan role pengguna.
 */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Sidebar } from "@/components/features/layout/Sidebar";
import { Header } from "@/components/features/layout/Header";
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
 * Merender sidebar dan header yang disesuaikan dengan role pengguna.
 *
 * @param props.children - Konten halaman yang sedang aktif.
 * @returns Layout dashboard dengan sidebar, header, dan konten.
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar role={session.user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
