/**
 * Tipe-tipe TypeScript untuk entitas Activity Log.
 *
 * Merupakan mirror dari Pydantic schema `activity_log.py` di backend.
 * Activity log hanya dapat diakses oleh admin.
 */

/**
 * Jenis aksi yang dicatat dalam activity log.
 */
export type ActivityAction =
  | "login"
  | "create_instrument"
  | "update_instrument"
  | "delete_instrument"
  | "create_item"
  | "bulk_create_items"
  | "update_item"
  | "delete_item"
  | "assign_expert"
  | "delete_assignment"
  | "submit_rating"
  | "bulk_submit_ratings"
  | "update_rating"
  | "export_cvi_excel"
  | "update_user"
  | "deactivate_user";

/**
 * Tipe resource yang menjadi objek dari suatu aksi.
 */
export type ResourceType =
  | "user"
  | "instrument"
  | "item"
  | "expert_assignment"
  | "assignment"
  | "rating";

/**
 * Data lengkap activity log yang dikembalikan oleh API.
 */
export interface ActivityLogResponse {
  id: string;
  user_id: string | null;
  action: ActivityAction;
  resource_type: ResourceType | null;
  resource_id: string | null;
  ip_address: string;
  user_agent: string | null;
  /** Metadata tambahan, misalnya `{ count: 20 }` atau `{ expert_id: "uuid" }`. */
  metadata_: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Parameter filter untuk query activity logs.
 */
export interface ActivityLogFilter {
  user_id?: string;
  action?: ActivityAction;
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
}
