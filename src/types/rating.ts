/**
 * Tipe-tipe TypeScript untuk entitas Rating.
 *
 * Merupakan mirror dari Pydantic schema `rating.py` di backend.
 * Skor relevansi menggunakan skala 1–4 (1=tidak relevan, 4=sangat relevan).
 */

/**
 * Satu item penilaian dalam bulk submission.
 */
export interface RatingItem {
  item_id: string;
  /** Skor relevansi skala 1–4. */
  relevance_score: 1 | 2 | 3 | 4;
  notes?: string;
}

/**
 * Payload untuk submit semua penilaian dalam satu assignment sekaligus.
 */
export interface RatingBulkCreate {
  ratings: RatingItem[];
}

/**
 * Payload untuk memperbarui satu penilaian (partial update).
 */
export interface RatingUpdate {
  relevance_score?: 1 | 2 | 3 | 4;
  notes?: string;
}

/**
 * Data lengkap rating yang dikembalikan oleh API.
 */
export interface RatingResponse {
  id: string;
  assignment_id: string;
  item_id: string;
  user_id: string;
  relevance_score: 1 | 2 | 3 | 4;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
