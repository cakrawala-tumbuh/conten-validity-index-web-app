/**
 * Komponen Sidebar navigasi untuk dashboard CVI Web App.
 *
 * Menampilkan menu navigasi yang berbeda berdasarkan role pengguna.
 * Admin mendapat akses ke semua menu, expert hanya ke menu yang relevan.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Users, ClipboardList, Activity, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/user";
import { APP_NAME } from "@/constants";

/**
 * Props untuk Sidebar.
 */
interface SidebarProps {
  role: UserRole;
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
 * @param props.role - Role pengguna ("admin" atau "expert").
 * @returns Sidebar dengan navigasi yang sesuai role.
 */
export const Sidebar = ({ role }: SidebarProps) => {
  const pathname = usePathname();
  const navItems = role === "admin" ? ADMIN_NAV : EXPERT_NAV;

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <LayoutDashboard className="h-6 w-6 text-blue-600" />
        <span className="text-sm font-semibold text-gray-900">{APP_NAME}</span>
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
  );
};
