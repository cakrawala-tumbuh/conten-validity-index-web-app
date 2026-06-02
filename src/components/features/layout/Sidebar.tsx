/**
 * Komponen Sidebar navigasi untuk dashboard CVI Web App.
 *
 * Menampilkan menu navigasi yang berbeda berdasarkan role pengguna.
 * Admin mendapat akses ke semua menu, expert hanya ke menu yang relevan.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Users, ClipboardList, Activity, LayoutDashboard, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/user";
import { APP_NAME } from "@/constants";

/**
 * Props untuk Sidebar.
 */
interface SidebarProps {
  role: UserRole;
  /**
   * Status terbuka untuk mode mobile (drawer off-canvas).
   * Diabaikan pada layar `md` ke atas (sidebar selalu tampil statis).
   * Default: `false`.
   */
  isOpen?: boolean;
  /**
   * Callback saat sidebar mobile diminta untuk ditutup
   * (klik overlay, tombol tutup, atau memilih menu).
   */
  onClose?: () => void;
}

/**
 * Item navigasi di sidebar.
 */
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/** Menu navigasi untuk admin. */
const ADMIN_NAV: NavItem[] = [
  { href: "/instruments", label: "Instrumen", icon: FileText },
  { href: "/users", label: "Pengguna", icon: Users },
  { href: "/activity-logs", label: "Log Aktivitas", icon: Activity },
];

/** Menu navigasi untuk expert. */
const EXPERT_NAV: NavItem[] = [
  { href: "/my-assignments", label: "Penilaian Saya", icon: ClipboardList },
];

/**
 * Sidebar navigasi dengan role-based menu.
 *
 * Menampilkan logo aplikasi di atas, lalu daftar menu navigasi
 * yang disesuaikan dengan role pengguna yang sedang login.
 *
 * Pada layar kecil (mobile) sidebar tampil sebagai drawer off-canvas yang
 * dikontrol melalui prop `isOpen`/`onClose`. Pada layar `md` ke atas sidebar
 * selalu tampil statis di sisi kiri.
 *
 * @param props.role - Role pengguna ("admin" atau "expert").
 * @param props.isOpen - Status terbuka drawer pada mode mobile.
 * @param props.onClose - Callback untuk menutup drawer mobile.
 * @returns Sidebar dengan navigasi yang sesuai role.
 */
export const Sidebar = ({ role, isOpen = false, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const navItems = role === "admin" ? ADMIN_NAV : EXPERT_NAV;

  return (
    <>
      {/* Overlay gelap di belakang drawer — hanya tampil di mobile saat terbuka */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-hidden="true"
          data-testid="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white",
          "transition-transform duration-200 ease-in-out",
          "md:static md:z-auto md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-gray-200 px-6">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">{APP_NAME}</span>
          </div>
          {/* Tombol tutup — hanya tampil di mobile */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu navigasi"
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};
