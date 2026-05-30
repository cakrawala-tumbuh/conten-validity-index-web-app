/**
 * Daftar assignment untuk halaman "Penilaian Saya" (expert).
 *
 * Menampilkan kartu untuk setiap instrumen yang ditugaskan kepada expert,
 * dengan status penilaian dan link ke form penilaian.
 */
"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { ASSIGNMENT_STATUS_LABELS } from "@/constants";
import type { AssignmentResponse } from "@/types/expert-assignment";

/**
 * Props untuk AssignmentList.
 */
interface AssignmentListProps {
  assignments: AssignmentResponse[];
}

/**
 * Menampilkan daftar assignment dalam format kartu.
 *
 * Setiap kartu menampilkan nama instrumen, status assignment (dengan badge),
 * dan tombol untuk mulai/lanjutkan penilaian.
 *
 * @param props.assignments - Array data assignment milik expert.
 * @returns Daftar kartu assignment atau pesan kosong jika tidak ada.
 */
export const AssignmentList = ({ assignments }: AssignmentListProps) => {
  if (assignments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <ClipboardList className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-3 text-sm text-gray-500">
          Belum ada instrumen yang ditugaskan kepada Anda.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {assignments.map((assignment) => (
        <li
          key={assignment.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-6 py-4"
        >
          <div>
            <p className="text-sm font-medium text-gray-900">
              Instrumen #{assignment.instrument_id.slice(0, 8)}
            </p>
            <span className="mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
              {ASSIGNMENT_STATUS_LABELS[assignment.status]}
            </span>
          </div>
          <Link
            href={`/my-assignments/${assignment.id}`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            {assignment.status === "pending" ? "Mulai" : "Lanjutkan"}
          </Link>
        </li>
      ))}
    </ul>
  );
};
