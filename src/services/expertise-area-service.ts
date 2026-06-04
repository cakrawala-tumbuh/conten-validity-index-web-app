/**
 * Service untuk operasi terkait bidang keahlian (expertise areas).
 *
 * Menyediakan fungsi untuk mengambil dan mengelola daftar master bidang
 * keahlian melalui backend REST API. Operasi tulis hanya untuk admin.
 */
import { apiRequest } from "@/lib/api";
import type {
  ExpertiseAreaCreate,
  ExpertiseAreaResponse,
  ExpertiseAreaUpdate,
} from "@/types/expertise-area";
import type { PaginationParams } from "@/types/common";

/**
 * Mengambil seluruh bidang keahlian pada daftar master.
 *
 * @param token - Access token dari session.
 * @param params - Parameter pagination opsional.
 * @returns Array bidang keahlian.
 * @throws {ApiError} Jika token tidak valid atau expired.
 */
export async function listExpertiseAreas(
  token: string,
  params: PaginationParams = {},
): Promise<ExpertiseAreaResponse[]> {
  const query = new URLSearchParams();
  if (params.skip !== undefined) query.set("skip", String(params.skip));
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<ExpertiseAreaResponse[]>(`/api/v1/expertise-areas/${qs}`, { token });
}

/**
 * Membuat bidang keahlian baru (admin only).
 *
 * @param token - Access token admin.
 * @param data - Data bidang keahlian baru.
 * @returns Bidang keahlian yang baru dibuat.
 * @throws {ApiError} Jika nama sudah ada (409) atau bukan admin (403).
 */
export async function createExpertiseArea(
  token: string,
  data: ExpertiseAreaCreate,
): Promise<ExpertiseAreaResponse> {
  return apiRequest<ExpertiseAreaResponse>("/api/v1/expertise-areas/", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Memperbarui bidang keahlian (admin only).
 *
 * @param token - Access token admin.
 * @param id - ID bidang keahlian yang akan diperbarui.
 * @param data - Data pembaruan (partial update).
 * @returns Bidang keahlian setelah diperbarui.
 * @throws {ApiError} Jika tidak ditemukan (404), nama duplikat (409), atau bukan admin (403).
 */
export async function updateExpertiseArea(
  token: string,
  id: string,
  data: ExpertiseAreaUpdate,
): Promise<ExpertiseAreaResponse> {
  return apiRequest<ExpertiseAreaResponse>(`/api/v1/expertise-areas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Menghapus bidang keahlian (admin only).
 *
 * @param token - Access token admin.
 * @param id - ID bidang keahlian yang akan dihapus.
 * @returns Pesan konfirmasi.
 * @throws {ApiError} Jika tidak ditemukan (404) atau bukan admin (403).
 */
export async function deleteExpertiseArea(token: string, id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/v1/expertise-areas/${id}`, {
    method: "DELETE",
    token,
  });
}
