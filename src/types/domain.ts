/**
 * Tipe-tipe TypeScript untuk entitas Domain.
 *
 * Merupakan mirror dari Pydantic schema `domain.py` di backend.
 * Domain merepresentasikan dimensi/kelompok tematik dalam instrumen.
 */

/**
 * Payload untuk membuat domain baru.
 */
export interface DomainCreate {
  /** Nama domain/dimensi. */
  name: string;
}

/**
 * Payload untuk memperbarui domain (partial update).
 */
export interface DomainUpdate {
  /** Nama domain baru. */
  name?: string;
}

/**
 * Data lengkap domain yang dikembalikan oleh API.
 */
export interface DomainResponse {
  id: string;
  instrument_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}
