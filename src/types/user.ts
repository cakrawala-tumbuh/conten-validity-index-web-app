/**
 * Tipe-tipe TypeScript untuk entitas User.
 *
 * Merupakan mirror dari Pydantic schema `user.py` di backend.
 */

/**
 * Role yang tersedia untuk pengguna.
 * Dipetakan dari Authentik group membership oleh backend.
 */
export type UserRole = "admin" | "expert";

/**
 * Data lengkap pengguna yang dikembalikan oleh API.
 */
export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  institution: string | null;
  expertise_area: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Payload untuk memperbarui data pengguna (partial update).
 * Hanya admin yang dapat mengubah field `is_active`.
 */
export interface UserUpdate {
  institution?: string;
  expertise_area?: string;
  is_active?: boolean;
}
