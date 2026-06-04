/**
 * Halaman edit identitas pribadi pengguna yang sedang login.
 *
 * Mengambil profil pengguna dari backend, lalu menampilkannya dalam form
 * yang dapat diedit (nama lengkap, institusi, bidang keahlian).
 */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getMe } from "@/services/user-service";
import { listExpertiseAreas } from "@/services/expertise-area-service";
import { ProfileForm } from "@/components/features/users/ProfileForm";
import type { UserResponse } from "@/types/user";
import type { ExpertiseAreaResponse } from "@/types/expertise-area";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil Saya — CVI",
};

/**
 * Halaman profil pengguna — Server Component.
 *
 * Mengambil profil pengguna yang sedang login dan meneruskannya ke form
 * edit identitas pribadi. Mengarahkan ke login jika belum terautentikasi.
 *
 * @returns Halaman edit identitas pribadi, atau pesan error bila gagal memuat.
 */
export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  let user: UserResponse | null = null;
  let expertiseAreas: ExpertiseAreaResponse[] = [];
  let fetchError: string | null = null;

  try {
    [user, expertiseAreas] = await Promise.all([
      getMe(session.accessToken),
      listExpertiseAreas(session.accessToken, { limit: 200 }),
    ]);
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Gagal mengambil data profil dari server.";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Profil Saya</h1>
        <p className="mt-1 text-sm text-gray-500">
          Perbarui identitas pribadi Anda. Email dan role dikelola oleh penyedia login.
        </p>
      </div>

      {fetchError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Gagal memuat profil:</strong> {fetchError}
        </div>
      ) : (
        user && <ProfileForm user={user} expertiseAreaOptions={expertiseAreas} />
      )}
    </div>
  );
}
