/**
 * Komponen tabel manajemen pengguna untuk admin.
 *
 * Menampilkan daftar pengguna dalam tabel dengan kolom nama, email, role,
 * institusi, dan status aktif. Menyediakan aksi edit dan nonaktifkan user.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Check, UserX } from "lucide-react";
import { USER_ROLE_LABELS } from "@/constants";
import type { UserResponse, UserUpdate } from "@/types/user";
import type { ExpertiseAreaResponse } from "@/types/expertise-area";
import { ExpertiseAreaSelect } from "@/components/features/expertise-areas/ExpertiseAreaSelect";

/**
 * Props untuk UserTable.
 */
interface UserTableProps {
  initialUsers: UserResponse[];
  /** Daftar master bidang keahlian yang dapat ditetapkan ke pengguna. */
  expertiseAreaOptions: ExpertiseAreaResponse[];
}

/**
 * Tabel daftar pengguna dengan aksi edit dan nonaktifkan.
 *
 * Mendukung edit inline untuk `institution` dan bidang keahlian (multi-select).
 * Tombol nonaktifkan akan melakukan soft delete (is_active = false) dengan konfirmasi.
 *
 * @param props.initialUsers - Daftar pengguna awal dari server.
 * @param props.expertiseAreaOptions - Daftar master bidang keahlian.
 * @returns Komponen tabel pengguna interaktif.
 */
export const UserTable = ({ initialUsers, expertiseAreaOptions }: UserTableProps) => {
  const router = useRouter();
  const [users, setUsers] = useState<UserResponse[]>(initialUsers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInstitution, setEditInstitution] = useState("");
  const [editExpertiseIds, setEditExpertiseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleColor: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700",
    expert: "bg-blue-100 text-blue-700",
  };

  /**
   * Memulai mode edit untuk user tertentu.
   *
   * @param user - User yang akan diedit.
   */
  const startEdit = (user: UserResponse) => {
    setEditingId(user.id);
    setEditInstitution(user.institution ?? "");
    setEditExpertiseIds(user.expertise_areas.map((area) => area.id));
    setError(null);
  };

  /**
   * Membatalkan mode edit.
   */
  const cancelEdit = () => {
    setEditingId(null);
    setError(null);
  };

  /**
   * Menyimpan perubahan data pengguna.
   *
   * @param userId - ID pengguna yang diperbarui.
   */
  const saveEdit = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const body: UserUpdate = {
        institution: editInstitution.trim() || undefined,
        expertise_area_ids: editExpertiseIds,
      };
      const resp = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menyimpan perubahan (${resp.status})`);
      }
      const updated: UserResponse = await resp.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Menonaktifkan pengguna (soft delete) setelah konfirmasi.
   *
   * @param user - User yang akan dinonaktifkan.
   */
  const deactivateUser = async (user: UserResponse) => {
    if (
      !confirm(`Nonaktifkan pengguna "${user.full_name}"? Pengguna tidak akan bisa login lagi.`)
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menonaktifkan pengguna (${resp.status})`);
      }
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: false } : u)));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menonaktifkan pengguna.");
    } finally {
      setLoading(false);
    }
  };

  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Belum ada pengguna terdaftar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Nama
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="w-28 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Institusi / Keahlian
              </th>
              <th className="w-24 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="w-24 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) =>
              editingId === user.id ? (
                <tr key={user.id} className="bg-yellow-50">
                  <td className="px-4 py-3" colSpan={2}>
                    <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${roleColor[user.role] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {USER_ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editInstitution}
                        onChange={(e) => setEditInstitution(e.target.value)}
                        placeholder="Institusi..."
                        className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                      <ExpertiseAreaSelect
                        options={expertiseAreaOptions}
                        selectedIds={editExpertiseIds}
                        onChange={setEditExpertiseIds}
                        disabled={loading}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => saveEdit(user.id)}
                        disabled={loading}
                        className="rounded-md p-1.5 text-green-600 hover:bg-green-50 transition disabled:opacity-50"
                        title="Simpan"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 transition"
                        title="Batal"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr
                  key={user.id}
                  className={`hover:bg-gray-50 ${!user.is_active ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${roleColor[user.role] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {USER_ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700">{user.institution ?? "—"}</p>
                    {user.expertise_areas.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {user.expertise_areas.map((area) => (
                          <span
                            key={area.id}
                            className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                          >
                            {area.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-300 italic">Belum ada keahlian</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {user.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => startEdit(user)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {user.is_active && (
                        <button
                          type="button"
                          onClick={() => deactivateUser(user)}
                          disabled={loading}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                          title="Nonaktifkan"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
