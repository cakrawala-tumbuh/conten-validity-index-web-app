/**
 * Tipe-tipe TypeScript untuk entitas Instrument.
 *
 * Merupakan mirror dari Pydantic schema `instrument.py` di backend.
 */

/**
 * Status lifecycle instrumen.
 */
export type InstrumentStatus = "draft" | "active" | "closed";

/**
 * Payload untuk membuat instrumen baru.
 */
export interface InstrumentCreate {
  name: string;
  description?: string;
  version?: string;
}

/**
 * Payload untuk memperbarui instrumen (partial update).
 */
export interface InstrumentUpdate {
  name?: string;
  description?: string;
  version?: string;
  status?: InstrumentStatus;
}

/**
 * Data lengkap instrumen yang dikembalikan oleh API.
 */
export interface InstrumentResponse {
  id: string;
  name: string;
  description: string | null;
  version: string;
  status: InstrumentStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}
