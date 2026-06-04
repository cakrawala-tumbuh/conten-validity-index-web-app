/**
 * Tipe-tipe TypeScript untuk entitas User.
 *
 * Merupakan mirror dari Pydantic schema `user.py` di backend.
 */
import type { ExpertiseAreaResponse } from "@/types/expertise-area";

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
  expertise_areas: ExpertiseAreaResponse[];
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Payload untuk memperbarui data pengguna (partial update, admin only).
 * `expertise_area_ids` menggantikan seluruh keahlian pengguna bila dikirim.
 */
export interface UserUpdate {
  institution?: string;
  expertise_area_ids?: string[];
  is_active?: boolean;
}

/**
 * Payload bagi pengguna untuk memperbarui identitas pribadinya sendiri
 * melalui endpoint `PATCH /users/me` (partial update).
 *
 * Mengizinkan perubahan `full_name` dan daftar bidang keahlian, namun tidak
 * `is_active` (khusus admin).
 */
export interface UserSelfUpdate {
  full_name?: string;
  institution?: string;
  expertise_area_ids?: string[];
}
