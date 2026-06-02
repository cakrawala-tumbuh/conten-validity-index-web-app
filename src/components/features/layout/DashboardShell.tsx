/**
 * Shell layout dashboard yang responsif (Client Component).
 *
 * Mengoordinasikan state buka/tutup sidebar drawer pada mode mobile antara
 * `Header` (tombol hamburger) dan `Sidebar` (drawer off-canvas). Pada layar
 * `md` ke atas, sidebar tampil statis dan state drawer tidak berpengaruh.
 */
"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/features/layout/Sidebar";
import { Header } from "@/components/features/layout/Header";
import type { UserRole } from "@/types/user";

/**
 * Data pengguna yang dibutuhkan oleh shell dashboard.
 */
interface DashboardShellUser {
  name?: string | null;
  email?: string | null;
  role: UserRole;
}

/**
 * Props untuk DashboardShell.
 */
interface DashboardShellProps {
  user: DashboardShellUser;
  children: ReactNode;
}

/**
 * Merender kerangka dashboard responsif: sidebar, header, dan area konten.
 *
 * Menyimpan state `isSidebarOpen` untuk mengontrol drawer pada layar kecil.
 *
 * @param props.user - Data pengguna untuk header dan penentuan menu sidebar.
 * @param props.children - Konten halaman aktif yang dirender di area utama.
 * @returns Kerangka dashboard dengan navigasi responsif.
 *
 * @example
 * ```tsx
 * <DashboardShell user={session.user}>{children}</DashboardShell>
 * ```
 */
export const DashboardShell = ({ user, children }: DashboardShellProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar role={user.role} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};
