/**
 * Komponen tabel log aktivitas pengguna untuk admin.
 *
 * Menampilkan daftar log aktivitas dalam tabel, dengan filter berdasarkan
 * action dan rentang tanggal, serta pagination manual.
 */
"use client";

import { useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import type { ActivityLogResponse, ActivityAction } from "@/types/activity-log";

/**
 * Label ramah untuk setiap jenis aksi.
 */
const ACTION_LABELS: Record<ActivityAction, string> = {
  login: "Login",
  create_instrument: "Buat Instrumen",
  update_instrument: "Update Instrumen",
  delete_instrument: "Hapus Instrumen",
  create_item: "Buat Item",
  bulk_create_items: "Buat Item (Massal)",
  update_item: "Update Item",
  delete_item: "Hapus Item",
  assign_expert: "Tugaskan Expert",
  delete_assignment: "Hapus Assignment",
  submit_rating: "Submit Rating",
  bulk_submit_ratings: "Submit Rating (Massal)",
  update_rating: "Update Rating",
  export_cvi_excel: "Export CVI Excel",
  update_user: "Update Pengguna",
  deactivate_user: "Nonaktifkan Pengguna",
};

/**
 * Warna badge per kategori aksi.
 */
function getActionColor(action: string): string {
  if (action.startsWith("delete") || action === "deactivate_user") {
    return "bg-red-100 text-red-700";
  }
  if (action.startsWith("create") || action.startsWith("bulk") || action === "assign_expert") {
    return "bg-green-100 text-green-700";
  }
  if (action.startsWith("update") || action.startsWith("submit")) {
    return "bg-blue-100 text-blue-700";
  }
  return "bg-gray-100 text-gray-600";
}

/**
 * Props untuk ActivityLogTable.
 */
interface ActivityLogTableProps {
  initialLogs: ActivityLogResponse[];
}

/**
 * Tabel log aktivitas dengan filter dan refresh.
 *
 * Mengambil data fresh dari API saat filter berubah atau tombol refresh ditekan.
 *
 * @param props.initialLogs - Log awal dari server.
 * @returns Komponen tabel log aktivitas interaktif.
 */
export const ActivityLogTable = ({ initialLogs }: ActivityLogTableProps) => {
  const [logs, setLogs] = useState<ActivityLogResponse[]>(initialLogs);
  const [filterAction, setFilterAction] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Memuat ulang log dari API dengan filter yang aktif.
   */
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (filterAction) params.set("action", filterAction);
      if (filterStartDate) params.set("start_date", filterStartDate);
      if (filterEndDate) params.set("end_date", filterEndDate);

      const resp = await fetch(`/api/activity-logs?${params.toString()}`);
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal memuat log (${resp.status})`);
      }
      const data: ActivityLogResponse[] = await resp.json();
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat log aktivitas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex-1 min-w-40">
          <label className="block text-xs text-gray-500 mb-1">Jenis Aksi</label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">Semua aksi</option>
            {(Object.keys(ACTION_LABELS) as ActivityAction[]).map((action) => (
              <option key={action} value={action}>
                {ACTION_LABELS[action]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Dari Tanggal</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sampai Tanggal</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {loading ? "Memuat..." : "Terapkan Filter"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="text-xs text-gray-500">Menampilkan {logs.length} log</div>

      {logs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">Tidak ada log aktivitas ditemukan.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Waktu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Pengguna
                  </th>
                  <th className="w-48 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Aksi
                  </th>
                  <th className="w-36 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Resource
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {log.user_id ? (
                        log.user_id.slice(0, 8) + "..."
                      ) : (
                        <span className="text-gray-400 italic">sistem</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getActionColor(log.action)}`}
                      >
                        {ACTION_LABELS[log.action as ActivityAction] ?? log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {log.resource_type && (
                        <span>
                          {log.resource_type}
                          {log.resource_id && (
                            <span className="ml-1 font-mono">#{log.resource_id.slice(0, 6)}</span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
