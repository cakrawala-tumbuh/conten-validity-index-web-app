/**
 * Service untuk operasi terkait instrumen CVI.
 *
 * Menyediakan fungsi CRUD instrumen, kalkulasi CVI, dan export Excel
 * melalui backend REST API.
 */
import { apiRequest, apiDownload } from "@/lib/api";
import type { InstrumentCreate, InstrumentUpdate, InstrumentResponse } from "@/types/instrument";
import type { PaginationParams } from "@/types/common";
import type { CVIResult } from "@/types/cvi";

/**
 * Mengambil daftar instrumen.
 *
 * Admin mendapat semua instrumen. Expert hanya mendapat instrumen
 * yang ditugaskan kepada mereka.
 *
 * @param token - Access token dari session.
 * @param params - Parameter pagination opsional.
 * @returns Array data instrumen.
 * @throws {ApiError} Jika token tidak valid.
 */
export async function listInstruments(
  token: string,
  params: PaginationParams = {},
): Promise<InstrumentResponse[]> {
  const query = new URLSearchParams();
  if (params.skip !== undefined) query.set("skip", String(params.skip));
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<InstrumentResponse[]>(`/api/v1/instruments/${qs}`, { token });
}

/**
 * Membuat instrumen baru (hanya admin).
 *
 * @param token - Access token admin.
 * @param data - Data instrumen yang akan dibuat.
 * @returns Data instrumen yang baru dibuat.
 * @throws {ApiError} Jika bukan admin (403).
 */
export async function createInstrument(
  token: string,
  data: InstrumentCreate,
): Promise<InstrumentResponse> {
  return apiRequest<InstrumentResponse>("/api/v1/instruments/", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Mengambil detail satu instrumen.
 *
 * @param token - Access token dari session.
 * @param instrumentId - ID instrumen yang dicari.
 * @returns Data instrumen yang diminta.
 * @throws {ApiError} Jika instrumen tidak ditemukan (404).
 */
export async function getInstrument(
  token: string,
  instrumentId: string,
): Promise<InstrumentResponse> {
  return apiRequest<InstrumentResponse>(`/api/v1/instruments/${instrumentId}`, { token });
}

/**
 * Memperbarui instrumen (hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen yang akan diperbarui.
 * @param data - Data yang akan diperbarui (partial update).
 * @returns Data instrumen setelah diperbarui.
 * @throws {ApiError} Jika instrumen tidak ditemukan (404) atau bukan admin (403).
 */
export async function updateInstrument(
  token: string,
  instrumentId: string,
  data: InstrumentUpdate,
): Promise<InstrumentResponse> {
  return apiRequest<InstrumentResponse>(`/api/v1/instruments/${instrumentId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Menghapus instrumen beserta semua item dan assignment-nya (hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen yang akan dihapus.
 * @returns Pesan konfirmasi.
 * @throws {ApiError} Jika instrumen tidak ditemukan (404) atau bukan admin (403).
 */
export async function deleteInstrument(
  token: string,
  instrumentId: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/v1/instruments/${instrumentId}`, {
    method: "DELETE",
    token,
  });
}

/**
 * Menghitung CVI untuk satu instrumen (hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen yang akan dikalkulasi.
 * @returns Hasil kalkulasi CVI lengkap.
 * @throws {ApiError} Jika instrumen tidak ditemukan (404) atau bukan admin (403).
 */
export async function calculateCVI(token: string, instrumentId: string): Promise<CVIResult> {
  return apiRequest<CVIResult>(`/api/v1/instruments/${instrumentId}/cvi`, { token });
}

/**
 * Men-download hasil CVI dalam format Excel (hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen yang akan di-export.
 * @param filename - Nama file untuk hasil download.
 * @throws {ApiError} Jika instrumen tidak ditemukan (404) atau bukan admin (403).
 */
export async function exportCVIExcel(
  token: string,
  instrumentId: string,
  filename: string,
): Promise<void> {
  await apiDownload(`/api/v1/instruments/${instrumentId}/cvi/export`, token, filename);
}
