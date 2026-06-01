/**
 * Service untuk operasi terkait assignment expert ke instrumen.
 *
 * Menyediakan fungsi untuk mengelola penugasan expert dan
 * mengambil assignment milik pengguna yang sedang login.
 */
import { apiRequest } from "@/lib/api";
import type { AssignmentCreate, AssignmentResponse } from "@/types/expert-assignment";

/**
 * Mengambil daftar assignment dalam satu instrumen (hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen yang dicari assignmentnya.
 * @returns Array data assignment.
 * @throws {ApiError} Jika instrumen tidak ditemukan (404) atau bukan admin (403).
 */
export async function listAssignments(
  token: string,
  instrumentId: string,
): Promise<AssignmentResponse[]> {
  return apiRequest<AssignmentResponse[]>(`/api/v1/instruments/${instrumentId}/assignments`, {
    token,
  });
}

/**
 * Menugaskan expert ke instrumen (hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen yang akan ditugaskan.
 * @param data - Data assignment baru (user_id expert).
 * @returns Data assignment yang baru dibuat.
 * @throws {ApiError} Jika instrumen/user tidak ditemukan (404) atau bukan admin (403).
 */
export async function createAssignment(
  token: string,
  instrumentId: string,
  data: AssignmentCreate,
): Promise<AssignmentResponse> {
  return apiRequest<AssignmentResponse>(`/api/v1/instruments/${instrumentId}/assignments`, {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Menghapus assignment expert dari instrumen (hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen.
 * @param assignmentId - ID assignment yang akan dihapus.
 * @returns Pesan konfirmasi.
 * @throws {ApiError} Jika assignment tidak ditemukan (404) atau bukan admin (403).
 */
export async function deleteAssignment(
  token: string,
  instrumentId: string,
  assignmentId: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    `/api/v1/instruments/${instrumentId}/assignments/${assignmentId}`,
    { method: "DELETE", token },
  );
}

/**
 * Mengambil daftar assignment milik pengguna yang sedang login (expert).
 *
 * @param token - Access token expert.
 * @returns Array data assignment milik expert yang sedang login.
 * @throws {ApiError} Jika token tidak valid.
 */
export async function getMyAssignments(token: string): Promise<AssignmentResponse[]> {
  return apiRequest<AssignmentResponse[]>("/api/v1/my-assignments", { token });
}
