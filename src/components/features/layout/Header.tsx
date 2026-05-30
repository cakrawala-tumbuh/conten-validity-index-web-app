/**
 * Komponen Header untuk dashboard CVI Web App.
 *
 * Menampilkan nama halaman aktif di kiri dan informasi pengguna
 * beserta tombol logout di kanan.
 */
"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { USER_ROLE_LABELS } from "@/constants";
import type { UserRole } from "@/types/user";

/**
 * Data user yang ditampilkan di header.
 */
interface HeaderUser {
  name?: string | null;
  email?: string | null;
  role: UserRole;
}

/**
 * Props untuk Header.
 */
interface HeaderProps {
  user: HeaderUser;
}

/**
 * Header dashboard dengan informasi pengguna dan tombol logout.
 *
 * Menampilkan nama, email, dan role pengguna yang sedang login,
 * serta tombol untuk melakukan logout.
 *
 * @param props.user - Data pengguna yang ditampilkan di header.
 * @returns Header dengan info user dan tombol logout.
 */
export const Header = ({ user }: HeaderProps) => {
  /**
   * Menangani logout pengguna.
   *
   * Memanggil `signOut` dengan redirect ke halaman login.
   */
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="flex h-16 items-center justify-end border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user.name ?? user.email}</p>
            <p className="text-xs text-gray-500">{USER_ROLE_LABELS[user.role]}</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          type="button"
          onClick={handleLogout}
          title="Keluar"
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};
