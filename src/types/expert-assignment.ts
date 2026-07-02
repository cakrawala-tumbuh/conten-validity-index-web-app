/**
 * Tipe-tipe TypeScript untuk entitas Expert Assignment.
 *
 * Merupakan mirror dari Pydantic schema `expert_assignment.py` di backend.
 */

/**
 * Status assignment expert terhadap satu instrumen.
 */
export type AssignmentStatus = "pending" | "in_progress" | "completed" | "archived";

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
  instrument_name: string | null;
  user_id: string;
  assigned_by: string;
  deadline: string | null;
  status: AssignmentStatus;
  assigned_at: string;
  updated_at: string;
  previous_assignment_id: string | null;
  revision_number: number;
  /** True jika penilaian diperhitungkan dalam CVI; false jika dinonaktifkan admin. */
  is_active: boolean;
}

/**
 * Hasil operasi arsip dan revisi assignment.
 *
 * Berisi assignment lama yang diarsipkan dan assignment baru yang dibuat.
 */
export interface RevisionResult {
  archived_assignment: AssignmentResponse;
  new_assignment: AssignmentResponse;
}
