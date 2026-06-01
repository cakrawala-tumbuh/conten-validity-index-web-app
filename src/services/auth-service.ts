/**
 * Service untuk sinkronisasi pengguna dengan backend setelah login.
 *
 * Backend memerlukan user sync setelah login via Authentik agar data
 * pengguna tersimpan di database lokal backend.
 */
import { apiRequest } from "@/lib/api";
import type { UserResponse } from "@/types/user";

/**
 * Menyinkronkan data pengguna dari Authentik JWT ke database backend.
 *
 * Dipanggil otomatis oleh NextAuth callback `signIn` setelah login berhasil.
 * Backend membaca JWT dari header Authorization dan sync ke DB.
 *
 * @param token - Access token dari Authentik.
 * @returns Data pengguna yang sudah disinkronkan.
 * @throws {ApiError} Jika sync gagal (misal: token invalid).
 */
export async function syncUser(token: string): Promise<UserResponse> {
  return apiRequest<UserResponse>("/api/v1/auth/sync/", {
    method: "POST",
    token,
  });
}
