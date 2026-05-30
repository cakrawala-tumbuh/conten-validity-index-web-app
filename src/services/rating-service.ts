/**
 * Service untuk operasi terkait penilaian (rating) expert.
 *
 * Menyediakan fungsi untuk mengambil, membuat, dan memperbarui
 * penilaian expert terhadap item instrumen.
 */
import { apiRequest } from "@/lib/api";
import type { RatingBulkCreate, RatingUpdate, RatingResponse } from "@/types/rating";

/**
 * Mengambil daftar penilaian untuk satu assignment.
 *
 * @param token - Access token dari session.
 * @param assignmentId - ID assignment yang dicari ratingnya.
 * @returns Array data rating.
 * @throws {ApiError} Jika assignment tidak ditemukan (404).
 */
export async function getRatings(token: string, assignmentId: string): Promise<RatingResponse[]> {
  return apiRequest<RatingResponse[]>(`/api/v1/assignments/${assignmentId}/ratings`, { token });
}

/**
 * Mengirimkan penilaian untuk semua item dalam satu assignment (bulk submit).
 *
 * Expert mengirimkan semua penilaian sekaligus dalam satu request.
 *
 * @param token - Access token expert.
 * @param assignmentId - ID assignment yang akan dinilai.
 * @param data - Data penilaian (array rating per item).
 * @returns Array data rating yang baru dibuat.
 * @throws {ApiError} Jika assignment tidak ditemukan (404) atau tidak authorized (403).
 */
export async function bulkSubmitRatings(
  token: string,
  assignmentId: string,
  data: RatingBulkCreate,
): Promise<RatingResponse[]> {
  return apiRequest<RatingResponse[]>(`/api/v1/assignments/${assignmentId}/ratings/bulk`, {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Memperbarui satu penilaian yang sudah ada.
 *
 * @param token - Access token expert.
 * @param assignmentId - ID assignment pemilik rating.
 * @param ratingId - ID rating yang akan diperbarui.
 * @param data - Data yang akan diperbarui.
 * @returns Data rating setelah diperbarui.
 * @throws {ApiError} Jika rating tidak ditemukan (404) atau tidak authorized (403).
 */
export async function updateRating(
  token: string,
  assignmentId: string,
  ratingId: string,
  data: RatingUpdate,
): Promise<RatingResponse> {
  return apiRequest<RatingResponse>(`/api/v1/assignments/${assignmentId}/ratings/${ratingId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}
