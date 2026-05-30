/**
 * Tipe-tipe TypeScript untuk entitas umum yang digunakan di seluruh aplikasi.
 *
 * Merupakan mirror dari Pydantic schema `common.py` di backend.
 */

/**
 * Response generik yang hanya berisi pesan teks.
 *
 * @example
 * { message: "User berhasil dinonaktifkan" }
 */
export interface MessageResponse {
  message: string;
}

/**
 * Wrapper untuk response yang berisi daftar item dengan pagination.
 *
 * @template T - Tipe item dalam daftar.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Parameter query umum untuk pagination.
 */
export interface PaginationParams {
  skip?: number;
  limit?: number;
}
