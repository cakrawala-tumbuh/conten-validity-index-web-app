/**
 * Halaman log aktivitas untuk admin.
 *
 * Menampilkan riwayat aktivitas semua pengguna di sistem dengan kemampuan
 * filter berdasarkan jenis aksi dan rentang tanggal.
 */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { listActivityLogs } from "@/services/activity-log-service";
import type { ActivityLogResponse } from "@/types/activity-log";
import { ActivityLogTable } from "@/components/features/activity-logs/ActivityLogTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log Aktivitas — CVI",
};

/**
 * Halaman log aktivitas — Server Component.
 *
 * Hanya dapat diakses oleh admin. Mengambil 50 log terbaru dari API
 * dan meneruskannya ke komponen tabel interaktif.
 *
 * @returns Halaman daftar log aktivitas dengan filter, atau pesan error.
 */
export default async function ActivityLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/my-assignments");

  let logs: ActivityLogResponse[] = [];
  let fetchError: string | null = null;

  try {
    logs = await listActivityLogs(session.accessToken, { limit: 50 });
  } catch (err) {
    fetchError =
      err instanceof Error ? err.message : "Gagal mengambil data log aktivitas dari server.";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Log Aktivitas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Riwayat semua aktivitas pengguna dalam sistem. Gunakan filter untuk mempersempit
          pencarian.
        </p>
      </div>

      {fetchError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Gagal memuat log aktivitas:</strong> {fetchError}
        </div>
      ) : (
        <ActivityLogTable initialLogs={logs} />
      )}
    </div>
  );
}
