/**
 * Service untuk operasi terkait item instrumen.
 *
 * Menyediakan fungsi CRUD item instrumen termasuk bulk create
 * melalui backend REST API.
 */
import { apiRequest } from "@/lib/api";
import type { ItemCreate, ItemBulkCreate, ItemUpdate, ItemResponse } from "@/types/item";

/**
 * Mengambil daftar item dalam satu instrumen.
 *
 * @param token - Access token dari session.
 * @param instrumentId - ID instrumen pemilik item.
 * @returns Array data item.
 * @throws {ApiError} Jika instrumen tidak ditemukan (404).
 */
export async function listItems(token: string, instrumentId: string): Promise<ItemResponse[]> {
  return apiRequest<ItemResponse[]>(`/api/v1/instruments/${instrumentId}/items`, { token });
}

/**
 * Membuat satu item baru dalam instrumen (hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen pemilik item.
 * @param data - Data item yang akan dibuat.
 * @returns Data item yang baru dibuat.
 * @throws {ApiError} Jika instrumen tidak ditemukan (404) atau bukan admin (403).
 */
export async function createItem(
  token: string,
  instrumentId: string,
  data: ItemCreate,
): Promise<ItemResponse> {
  return apiRequest<ItemResponse>(`/api/v1/instruments/${instrumentId}/items`, {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Membuat banyak item sekaligus dalam instrumen (bulk create — hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen pemilik item.
 * @param data - Daftar item yang akan dibuat.
 * @returns Array data item yang baru dibuat.
 * @throws {ApiError} Jika instrumen tidak ditemukan (404) atau bukan admin (403).
 */
export async function bulkCreateItems(
  token: string,
  instrumentId: string,
  data: ItemBulkCreate,
): Promise<ItemResponse[]> {
  return apiRequest<ItemResponse[]>(`/api/v1/instruments/${instrumentId}/items/bulk`, {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Memperbarui satu item (hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen pemilik item.
 * @param itemId - ID item yang akan diperbarui.
 * @param data - Data yang akan diperbarui.
 * @returns Data item setelah diperbarui.
 * @throws {ApiError} Jika item tidak ditemukan (404) atau bukan admin (403).
 */
export async function updateItem(
  token: string,
  instrumentId: string,
  itemId: string,
  data: ItemUpdate,
): Promise<ItemResponse> {
  return apiRequest<ItemResponse>(`/api/v1/instruments/${instrumentId}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Menghapus satu item dari instrumen (hanya admin).
 *
 * @param token - Access token admin.
 * @param instrumentId - ID instrumen pemilik item.
 * @param itemId - ID item yang akan dihapus.
 * @returns Pesan konfirmasi.
 * @throws {ApiError} Jika item tidak ditemukan (404) atau bukan admin (403).
 */
export async function deleteItem(
  token: string,
  instrumentId: string,
  itemId: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/v1/instruments/${instrumentId}/items/${itemId}`, {
    method: "DELETE",
    token,
  });
}
