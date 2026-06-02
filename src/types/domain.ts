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
  /** Definisi konstruk dari kisi-kisi (kolom D). */
  construct_definition?: string | null;
  /** Contoh indikator perilaku dari kisi-kisi (kolom E). */
  behavioral_indicator_example?: string | null;
  /** Referensi teori dari kisi-kisi (kolom F). */
  theory_reference?: string | null;
}

/**
 * Payload untuk memperbarui domain (partial update).
 */
export interface DomainUpdate {
  /** Nama domain baru. */
  name?: string;
  /** Definisi konstruk dari kisi-kisi (kolom D). */
  construct_definition?: string | null;
  /** Contoh indikator perilaku dari kisi-kisi (kolom E). */
  behavioral_indicator_example?: string | null;
  /** Referensi teori dari kisi-kisi (kolom F). */
  theory_reference?: string | null;
}

/**
 * Data lengkap domain yang dikembalikan oleh API.
 */
export interface DomainResponse {
  id: string;
  instrument_id: string;
  name: string;
  /** Definisi konstruk dari kisi-kisi (kolom D). */
  construct_definition: string | null;
  /** Contoh indikator perilaku dari kisi-kisi (kolom E). */
  behavioral_indicator_example: string | null;
  /** Referensi teori dari kisi-kisi (kolom F). */
  theory_reference: string | null;
  created_at: string;
  updated_at: string;
}
