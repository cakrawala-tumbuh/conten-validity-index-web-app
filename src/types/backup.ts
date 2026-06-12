/**
 * Tipe-tipe TypeScript untuk fitur backup dan restore database.
 *
 * Merupakan mirror dari Pydantic schema `backup.py` di backend.
 * Backup dan restore hanya dapat diakses oleh admin.
 */

/**
 * Representasi lengkap satu berkas backup database.
 *
 * Backup bersifat *logical*: seluruh baris setiap tabel diserialisasi
 * menjadi JSON sehingga portabel antar mesin.
 */
export interface BackupData {
  /** Versi format backup, untuk validasi kompatibilitas saat restore. */
  version: string;
  /** Waktu backup dibuat dalam format ISO 8601 (UTC). */
  created_at: string;
  /** Pemetaan nama tabel ke daftar baris yang diserialisasi. */
  tables: Record<string, Array<Record<string, unknown>>>;
}

/**
 * Ringkasan hasil operasi restore database.
 */
export interface RestoreResponse {
  /** Pesan status singkat. */
  message: string;
  /** Jumlah baris yang dipulihkan per tabel. */
  tables_restored: Record<string, number>;
  /** Total seluruh baris yang dipulihkan. */
  total_rows: number;
}
