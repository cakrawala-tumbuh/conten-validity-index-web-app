/**
 * Service untuk operasi terkait pengguna (user management).
 *
 * Menyediakan fungsi untuk mengambil dan mengelola data pengguna
 * melalui backend REST API.
 */
import { apiRequest } from "@/lib/api";
import type { UserResponse, UserUpdate } from "@/types/user";
import type { PaginationParams } from "@/types/common";

/**
 * Mengambil profil pengguna yang sedang login.
 *
 * @param token - Access token dari session.
 * @returns Data profil pengguna yang sedang login.
 * @throws {ApiError} Jika token tidak valid atau expired.
 */
export async function getMe(token: string): Promise<UserResponse> {
  return apiRequest<UserResponse>("/api/v1/users/me/", { token });
}

/**
 * Mengambil daftar semua pengguna (hanya admin).
 *
 * @param token - Access token admin.
 * @param params - Parameter pagination opsional.
 * @returns Array data pengguna.
 * @throws {ApiError} Jika token bukan milik admin (403).
 */
export async function listUsers(
  token: string,
  params: PaginationParams = {},
): Promise<UserResponse[]> {
  const query = new URLSearchParams();
  if (params.skip !== undefined) query.set("skip", String(params.skip));
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<UserResponse[]>(`/api/v1/users/${qs}`, { token });
}

/**
 * Mengambil detail satu pengguna berdasarkan ID (hanya admin).
 *
 * @param token - Access token admin.
 * @param userId - ID pengguna yang dicari.
 * @returns Data pengguna yang diminta.
 * @throws {ApiError} Jika user tidak ditemukan (404) atau bukan admin (403).
 */
export async function getUser(token: string, userId: string): Promise<UserResponse> {
  return apiRequest<UserResponse>(`/api/v1/users/${userId}`, { token });
}

/**
 * Memperbarui data pengguna (hanya admin).
 *
 * @param token - Access token admin.
 * @param userId - ID pengguna yang akan diperbarui.
 * @param data - Data yang akan diperbarui (partial update).
 * @returns Data pengguna setelah diperbarui.
 * @throws {ApiError} Jika user tidak ditemukan (404) atau bukan admin (403).
 */
export async function updateUser(
  token: string,
  userId: string,
  data: UserUpdate,
): Promise<UserResponse> {
  return apiRequest<UserResponse>(`/api/v1/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Menonaktifkan pengguna (soft delete — hanya admin).
 *
 * @param token - Access token admin.
 * @param userId - ID pengguna yang akan dinonaktifkan.
 * @returns Pesan konfirmasi.
 * @throws {ApiError} Jika user tidak ditemukan (404) atau bukan admin (403).
 */
export async function deactivateUser(token: string, userId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/v1/users/${userId}`, {
    method: "DELETE",
    token,
  });
}
