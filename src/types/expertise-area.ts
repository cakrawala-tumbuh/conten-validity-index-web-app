/**
 * Tipe-tipe TypeScript untuk entitas ExpertiseArea (bidang keahlian).
 *
 * Merupakan mirror dari Pydantic schema `expertise_area.py` di backend.
 */

/**
 * Data lengkap bidang keahlian yang dikembalikan oleh API.
 */
export interface ExpertiseAreaResponse {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Payload untuk membuat bidang keahlian baru (admin only).
 */
export interface ExpertiseAreaCreate {
  name: string;
  description?: string | null;
}

/**
 * Payload untuk memperbarui bidang keahlian (partial update, admin only).
 */
export interface ExpertiseAreaUpdate {
  name?: string;
  description?: string | null;
}
