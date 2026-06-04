/**
 * Halaman manajemen pengguna untuk admin.
 *
 * Menampilkan daftar semua pengguna dengan kemampuan edit data profil
 * (institusi, area keahlian) dan menonaktifkan pengguna (soft delete).
 */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { listUsers } from "@/services/user-service";
import { listExpertiseAreas } from "@/services/expertise-area-service";
import type { UserResponse } from "@/types/user";
import type { ExpertiseAreaResponse } from "@/types/expertise-area";
import { UserTable } from "@/components/features/users/UserTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengguna — CVI",
};

/**
 * Halaman manajemen pengguna — Server Component.
 *
 * Hanya dapat diakses oleh admin. Mengambil daftar semua pengguna
 * dari API dan meneruskannya ke komponen tabel interaktif.
 *
 * @returns Halaman daftar pengguna dengan aksi edit dan nonaktifkan, atau pesan error.
 */
export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/my-assignments");

  let users: UserResponse[] = [];
  let expertiseAreas: ExpertiseAreaResponse[] = [];
  let fetchError: string | null = null;

  try {
    [users, expertiseAreas] = await Promise.all([
      listUsers(session.accessToken, { limit: 200 }),
      listExpertiseAreas(session.accessToken, { limit: 200 }),
    ]);
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Gagal mengambil data pengguna dari server.";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pengguna</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola data pengguna sistem. Pengguna baru ditambahkan otomatis saat login pertama.
          </p>
        </div>
        {!fetchError && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
            {users.length} pengguna
          </span>
        )}
      </div>

      {fetchError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Gagal memuat pengguna:</strong> {fetchError}
        </div>
      ) : (
        <UserTable initialUsers={users} expertiseAreaOptions={expertiseAreas} />
      )}
    </div>
  );
}
