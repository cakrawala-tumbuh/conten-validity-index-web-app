/**
 * Halaman daftar assignment untuk expert.
 *
 * Menampilkan semua instrumen yang ditugaskan kepada expert yang sedang login,
 * beserta status penilaian masing-masing assignment.
 */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getMyAssignments } from "@/services/assignment-service";
import { AssignmentList } from "@/components/features/assignments/AssignmentList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Penilaian Saya — CVI",
};

/**
 * Halaman daftar assignment expert — Server Component.
 *
 * @returns Halaman dengan daftar assignment milik expert.
 */
export default async function MyAssignmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const assignments = await getMyAssignments(session.accessToken).catch(() => []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Penilaian Saya</h1>
      <AssignmentList assignments={assignments} />
    </div>
  );
}
