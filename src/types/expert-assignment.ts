/**
 * Tipe-tipe TypeScript untuk entitas Expert Assignment.
 *
 * Merupakan mirror dari Pydantic schema `expert_assignment.py` di backend.
 */

/**
 * Status assignment expert terhadap satu instrumen.
 */
export type AssignmentStatus = "pending" | "in_progress" | "completed";

/**
 * Payload untuk membuat assignment expert baru.
 */
export interface AssignmentCreate {
  user_id: string;
  deadline?: string;
}

/**
 * Data lengkap assignment yang dikembalikan oleh API.
 */
export interface AssignmentResponse {
  id: string;
  instrument_id: string;
  user_id: string;
  assigned_by: string;
  deadline: string | null;
  status: AssignmentStatus;
  assigned_at: string;
  updated_at: string;
}
