/**
 * Halaman manajemen daftar master bidang keahlian untuk admin.
 *
 * Menampilkan seluruh bidang keahlian dengan kemampuan tambah, edit, dan hapus.
 * Bidang keahlian ini menjadi pilihan yang dapat ditetapkan ke expert.
 */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { listExpertiseAreas } from "@/services/expertise-area-service";
import { ExpertiseAreaManager } from "@/components/features/expertise-areas/ExpertiseAreaManager";
import type { ExpertiseAreaResponse } from "@/types/expertise-area";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bidang Keahlian — CVI",
};

/**
 * Halaman master bidang keahlian — Server Component.
 *
 * Hanya dapat diakses oleh admin. Mengambil daftar bidang keahlian dari API
 * dan meneruskannya ke komponen manajemen interaktif.
 *
 * @returns Halaman daftar bidang keahlian, atau pesan error bila gagal memuat.
 */
export default async function ExpertiseAreasPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/my-assignments");

  let areas: ExpertiseAreaResponse[] = [];
  let fetchError: string | null = null;

  try {
    areas = await listExpertiseAreas(session.accessToken, { limit: 200 });
  } catch (err) {
    fetchError =
      err instanceof Error ? err.message : "Gagal mengambil data bidang keahlian dari server.";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Bidang Keahlian</h1>
        <p className="mt-1 text-sm text-gray-500">
          Kelola daftar master bidang keahlian. Expert dapat memilih dari daftar ini.
        </p>
      </div>

      {fetchError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Gagal memuat bidang keahlian:</strong> {fetchError}
        </div>
      ) : (
        <ExpertiseAreaManager initialAreas={areas} />
      )}
    </div>
  );
}
