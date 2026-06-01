/**
 * Service untuk operasi terkait domain/dimensi instrumen.
 *
 * Menyediakan fungsi CRUD domain melalui backend REST API.
 */
import { apiRequest } from "@/lib/api";
import type { DomainCreate, DomainUpdate, DomainResponse } from "@/types/domain";

/**
 * Mengambil daftar domain dalam satu instrumen.
 *
 * @param token - Access token dari session.
 * @param instrumentId - ID instrumen pemilik domain.
 * @returns Array data domain.
 * @throws {ApiError} Jika instrumen tidak ditemukan (404).
 */
export async function listDomains(token: string, instrumentId: string): Promise<DomainResponse[]> {
  return apiRequest<DomainResponse[]>(`/api/v1/instruments/${instrumentId}/domains/`, { token });
}

/**
 * Membuat domain baru dalam instrumen (hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen pemilik domain.
 * @param data - Data domain yang akan dibuat.
 * @returns Data domain yang baru dibuat.
 * @throws {ApiError} Jika instrumen tidak ditemukan (404) atau bukan admin (403).
 */
export async function createDomain(
  token: string,
  instrumentId: string,
  data: DomainCreate,
): Promise<DomainResponse> {
  return apiRequest<DomainResponse>(`/api/v1/instruments/${instrumentId}/domains/`, {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Memperbarui domain dalam instrumen (hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen pemilik domain.
 * @param domainId - ID domain yang akan diperbarui.
 * @param data - Data yang akan diperbarui.
 * @returns Data domain setelah diperbarui.
 * @throws {ApiError} Jika domain tidak ditemukan (404) atau bukan admin (403).
 */
export async function updateDomain(
  token: string,
  instrumentId: string,
  domainId: string,
  data: DomainUpdate,
): Promise<DomainResponse> {
  return apiRequest<DomainResponse>(`/api/v1/instruments/${instrumentId}/domains/${domainId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Menghapus domain dari instrumen (hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen pemilik domain.
 * @param domainId - ID domain yang akan dihapus.
 * @returns Pesan konfirmasi.
 * @throws {ApiError} Jika domain tidak ditemukan (404) atau bukan admin (403).
 */
export async function deleteDomain(
  token: string,
  instrumentId: string,
  domainId: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    `/api/v1/instruments/${instrumentId}/domains/${domainId}`,
    {
      method: "DELETE",
      token,
    },
  );
}
