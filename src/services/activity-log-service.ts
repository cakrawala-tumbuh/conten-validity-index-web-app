/**
 * Service untuk mengambil log aktivitas pengguna.
 *
 * Menyediakan fungsi untuk admin melihat riwayat aktivitas
 * semua pengguna di sistem.
 */
import { apiRequest } from "@/lib/api";
import type { ActivityLogResponse, ActivityLogFilter } from "@/types/activity-log";

/**
 * Mengambil daftar log aktivitas (hanya admin).
 *
 * Mendukung filter berdasarkan user, action, resource type, dan rentang waktu.
 * Hasil diurutkan dari yang terbaru.
 *
 * @param token - Access token admin.
 * @param filter - Filter opsional untuk mempersempit hasil.
 * @returns Array data log aktivitas.
 * @throws {ApiError} Jika token tidak valid atau bukan admin (403).
 */
export async function listActivityLogs(
  token: string,
  filter: ActivityLogFilter = {},
): Promise<ActivityLogResponse[]> {
  const query = new URLSearchParams();
  if (filter.user_id) query.set("user_id", filter.user_id);
  if (filter.action) query.set("action", filter.action);
  if (filter.resource_type) query.set("resource_type", filter.resource_type);
  if (filter.start_date) query.set("start_date", filter.start_date);
  if (filter.end_date) query.set("end_date", filter.end_date);
  if (filter.skip !== undefined) query.set("skip", String(filter.skip));
  if (filter.limit !== undefined) query.set("limit", String(filter.limit));
  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<ActivityLogResponse[]>(`/api/v1/activity-logs${qs}`, { token });
}
