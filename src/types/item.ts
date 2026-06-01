/**
 * Tipe-tipe TypeScript untuk entitas Item.
 *
 * Merupakan mirror dari Pydantic schema `item.py` di backend.
 */

/**
 * Payload untuk membuat satu item instrumen.
 */
export interface ItemCreate {
  sequence_number: number;
  content: string;
  /** ID domain/dimensi pengelompokan item. */
  domain_id?: string;
}

/**
 * Payload untuk membuat banyak item sekaligus (bulk create).
 */
export interface ItemBulkCreate {
  items: ItemCreate[];
}

/**
 * Payload untuk memperbarui item (partial update).
 */
export interface ItemUpdate {
  sequence_number?: number;
  content?: string;
  /** ID domain/dimensi baru, null untuk menghapus referensi. */
  domain_id?: string;
}

/**
 * Data lengkap item yang dikembalikan oleh API.
 */
export interface ItemResponse {
  id: string;
  instrument_id: string;
  sequence_number: number;
  content: string;
  /** ID domain/dimensi tempat item ini dikelompokkan. */
  domain_id: string | null;
  created_at: string;
  updated_at: string;
}
