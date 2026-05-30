/**
 * Tipe-tipe TypeScript untuk entitas Dimension.
 *
 * Merupakan mirror dari Pydantic schema `dimension.py` di backend.
 */

/**
 * Payload untuk membuat satu dimensi.
 */
export interface DimensionCreate {
  name: string;
  description?: string;
}

/**
 * Payload untuk membuat banyak dimensi sekaligus (bulk create).
 */
export interface DimensionBulkCreate {
  dimensions: DimensionCreate[];
}

/**
 * Payload untuk memperbarui dimensi (partial update).
 */
export interface DimensionUpdate {
  name?: string;
  description?: string;
}

/**
 * Data lengkap dimensi yang dikembalikan oleh API.
 */
export interface DimensionResponse {
  id: string;
  instrument_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}