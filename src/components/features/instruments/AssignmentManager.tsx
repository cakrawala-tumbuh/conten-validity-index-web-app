/**
 * Komponen manajemen assignment expert ke instrumen untuk admin.
 *
 * Menampilkan daftar expert yang sudah ditugaskan, form untuk menugaskan
 * expert baru, dan tombol untuk menghapus assignment.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Trash2, UserPlus } from "lucide-react";
import { ASSIGNMENT_STATUS_LABELS } from "@/constants";
import type { AssignmentResponse, RevisionResult } from "@/types/expert-assignment";
import type { UserResponse } from "@/types/user";
import { TableInfoTooltip } from "@/components/ui/Tooltip";

/**
 * Props untuk AssignmentManager.
 */
interface AssignmentManagerProps {
  instrumentId: string;
  initialAssignments: AssignmentResponse[];
  availableExperts: UserResponse[];
}

/**
 * Komponen manajemen assignment expert ke instrumen.
 *
 * Menampilkan tabel assignment yang aktif, dropdown pilih expert,
 * input opsional deadline, dan tombol hapus assignment.
 *
 * @param props.instrumentId - ID instrumen yang dikelola.
 * @param props.initialAssignments - Daftar assignment awal dari server.
 * @param props.availableExperts - Semua user expert aktif untuk dropdown.
 * @returns Komponen manajemen assignment interaktif.
 */
export const AssignmentManager = ({
  instrumentId,
  initialAssignments,
  availableExperts,
}: AssignmentManagerProps) => {
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignmentResponse[]>(initialAssignments);
  const [showForm, setShowForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeAssignedUserIds = new Set(
    assignments.filter((a) => a.status !== "archived").map((a) => a.user_id),
  );
  const unassignedExperts = availableExperts.filter((u) => !activeAssignedUserIds.has(u.id));

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    archived: "bg-gray-100 text-gray-500",
  };

  /**
   * Menugaskan expert yang dipilih ke instrumen.
   */
  const assignExpert = async () => {
    if (!selectedUserId) {
      setError("Pilih expert terlebih dahulu.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/instruments/${instrumentId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedUserId,
          deadline: deadline || undefined,
        }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menugaskan expert (${resp.status})`);
      }
      const created: AssignmentResponse = await resp.json();
      setAssignments((prev) => [...prev, created]);
      setSelectedUserId("");
      setDeadline("");
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menugaskan expert.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Menghapus assignment setelah konfirmasi pengguna.
   *
   * @param assignment - Assignment yang akan dihapus.
   */
  const removeAssignment = async (assignment: AssignmentResponse) => {
    const expert = availableExperts.find((u) => u.id === assignment.user_id);
    const label = expert?.full_name ?? assignment.user_id.slice(0, 8);
    if (
      !confirm(`Hapus penugasan ${label}? Expert tidak akan lagi dapat mengakses instrumen ini.`)
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/instruments/${instrumentId}/assignments/${assignment.id}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menghapus assignment (${resp.status})`);
      }
      setAssignments((prev) => prev.filter((a) => a.id !== assignment.id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus assignment.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mengarsipkan assignment dan membuat assignment revisi baru setelah konfirmasi.
   *
   * Assignment lama diubah ke status 'archived' (data tetap tersimpan sebagai
   * riwayat audit), dan assignment baru dibuat dengan salinan semua penilaian
   * yang sudah ada sehingga expert hanya perlu merevisi nilai yang keliru.
   *
   * @param assignment - Assignment yang akan diarsipkan dan direvisi.
   */
  const archiveAndRevise = async (assignment: AssignmentResponse) => {
    const expert = availableExperts.find((u) => u.id === assignment.user_id);
    const label = expert?.full_name ?? assignment.user_id.slice(0, 8);
    if (
      !confirm(
        `Arsipkan penilaian ${label} dan buat revisi baru?\n\n` +
          `Penilaian lama akan diarsipkan (tidak dihapus) dan assignment baru ` +
          `akan dibuat dengan salinan semua penilaian yang sudah ada. ` +
          `Expert hanya perlu merevisi nilai yang keliru.`,
      )
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(
        `/api/instruments/${instrumentId}/assignments/${assignment.id}/revise`,
        { method: "POST" },
      );
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal mengarsipkan assignment (${resp.status})`);
      }
      const result: RevisionResult = await resp.json();
      setAssignments((prev) =>
        prev
          .map((a) => (a.id === result.archived_assignment.id ? result.archived_assignment : a))
          .concat(result.new_assignment),
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengarsipkan assignment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{assignments.length} expert ditugaskan</span>
        {!showForm && unassignedExperts.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setError(null);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition"
          >
            <UserPlus className="h-3.5 w-3.5" /> Tugaskan Expert
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form tambah assignment */}
      {showForm && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
          <p className="text-xs font-medium text-blue-800">Tugaskan Expert Baru</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Expert *</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">— Pilih expert —</option>
                {unassignedExperts.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name}
                    {u.institution ? ` (${u.institution})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tenggat (opsional)</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError(null);
                setSelectedUserId("");
                setDeadline("");
              }}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={assignExpert}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Tugaskan"}
            </button>
          </div>
        </div>
      )}

      {/* Assignment table */}
      {assignments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
          <p className="text-sm text-gray-500">
            Belum ada expert yang ditugaskan. Klik &ldquo;Tugaskan Expert&rdquo; untuk memulai.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-medium text-gray-700">Daftar Penugasan Expert</h3>
            <TableInfoTooltip description="Daftar expert yang ditugaskan menilai instrumen ini beserta status pengerjaan (menunggu/sedang dikerjakan/selesai) dan tenggat waktu penilaian." />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Expert
                  </th>
                  <th className="w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tenggat
                  </th>
                  <th className="w-24 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignments.map((a) => {
                  const expert = availableExperts.find((u) => u.id === a.user_id);
                  return (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {expert?.full_name ?? a.user_id.slice(0, 8)}
                        </p>
                        {expert?.institution && (
                          <p className="text-xs text-gray-500">{expert.institution}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[a.status] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {ASSIGNMENT_STATUS_LABELS[a.status] ?? a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {a.deadline
                          ? new Date(a.deadline).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {a.status !== "archived" && (
                            <button
                              type="button"
                              onClick={() => archiveAndRevise(a)}
                              disabled={loading}
                              className="rounded-md p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition disabled:opacity-50"
                              title="Arsipkan & buat revisi baru"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeAssignment(a)}
                            disabled={loading}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                            title="Hapus assignment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
