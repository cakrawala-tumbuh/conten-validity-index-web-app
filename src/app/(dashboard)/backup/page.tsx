/**
 * Halaman backup & restore database untuk admin.
 *
 * Menyediakan antarmuka untuk mengunduh backup seluruh data aplikasi dan
 * memulihkan database dari berkas backup. Hanya dapat diakses oleh admin.
 */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { BackupRestorePanel } from "@/components/features/backup/BackupRestorePanel";

export const metadata: Metadata = {
  title: "Backup & Restore — CVI",
};

/**
 * Halaman backup & restore — Server Component.
 *
 * Memvalidasi sesi dan role admin sebelum menampilkan panel backup/restore.
 * Pengguna non-admin diarahkan ke halaman penilaian mereka.
 *
 * @returns Halaman backup & restore database.
 */
export default async function BackupPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/my-assignments");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Backup &amp; Restore</h1>
        <p className="mt-1 text-sm text-gray-500">
          Unduh cadangan seluruh data aplikasi atau pulihkan database dari berkas backup yang
          tersimpan.
        </p>
      </div>

      <BackupRestorePanel />
    </div>
  );
}
