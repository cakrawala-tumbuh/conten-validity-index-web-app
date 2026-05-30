/**
 * Service untuk operasi terkait dimensi instrumen.
 *
 * Menyediakan fungsi CRUD dimensi instrumen melalui backend REST API.
 */
import { apiRequest } from "@/lib/api";
import type {
  DimensionCreate,
  DimensionBulkCreate,
  DimensionUpdate,
  DimensionResponse,
} from "@/types/dimension";

/**
 * Mengambil daftar dimensi dalam satu instrumen.
 *
 * @param token - Access token dari session.
 * @param instrumentId - ID instrumen pemilik dimensi.
 * @returns Array data dimensi.
 * @throws {ApiError} Jika instrumen tidak ditemukan (404).
 */
export async function listDimensions(
  token: string,
  instrumentId: string,
): Promise<DimensionResponse[]> {
  return apiRequest<DimensionResponse[]>(
    `/api/v1/instruments/${instrumentId}/dimensions`,
    { token },
  );
}

/**
 * Membuat satu dimensi baru dalam instrumen (hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen pemilik dimensi.
 * @param data - Data dimensi yang akan dibuat.
 * @returns Data dimensi yang baru dibuat.
 * @throws {ApiError} Jika instrumen tidak ditemukan (404) atau bukan admin (403).
 */
export async function createDimension(
  token: string,
  instrumentId: string,
  data: DimensionCreate,
): Promise<DimensionResponse> {
  return apiRequest<DimensionResponse>(
    `/api/v1/instruments/${instrumentId}/dimensions`,
    {
      method: "POST",
      body: JSON.stringify(data),
      token,
    },
  );
}

/**
 * Membuat banyak dimensi sekaligus dalam instrumen (bulk create — hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen pemilik dimensi.
 * @param data - Daftar dimensi yang akan dibuat.
 * @returns Array data dimensi yang baru dibuat.
 * @throws {ApiError} Jika instrumen tidak ditemukan (404) atau bukan admin (403).
 */
export async function bulkCreateDimensions(
  token: string,
  instrumentId: string,
  data: DimensionBulkCreate,
): Promise<DimensionResponse[]> {
  return apiRequest<DimensionResponse[]>(
    `/api/v1/instruments/${instrumentId}/dimensions/bulk`,
    {
      method: "POST",
      body: JSON.stringify(data),
      token,
    },
  );
}

/**
 * Memperbarui satu dimensi (hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen pemilik dimensi.
 * @param dimensionId - ID dimensi yang akan diperbarui.
 * @param data - Data yang akan diperbarui.
 * @returns Data dimensi setelah diperbarui.
 * @throws {ApiError} Jika dimensi tidak ditemukan (404) atau bukan admin (403).
 */
export async function updateDimension(
  token: string,
  instrumentId: string,
  dimensionId: string,
  data: DimensionUpdate,
): Promise<DimensionResponse> {
  return apiRequest<DimensionResponse>(
    `/api/v1/instruments/${instrumentId}/dimensions/${dimensionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    },
  );
}

/**
 * Menghapus satu dimensi dari instrumen (hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen pemilik dimensi.
 * @param dimensionId - ID dimensi yang akan dihapus.
 * @returns Pesan konfirmasi.
 * @throws {ApiError} Jika dimensi tidak ditemukan (404) atau bukan admin (403).
 */
export async function deleteDimension(
  token: string,
  instrumentId: string,
  dimensionId: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    `/api/v1/instruments/${instrumentId}/dimensions/${dimensionId}`,
    {
      method: "DELETE",
      token,
    },
  );
}