/**
 * Halaman daftar instrumen untuk admin.
 *
 * Menampilkan semua instrumen dalam tabel dengan fitur untuk
 * membuat instrumen baru, melihat detail, dan mengelola item.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { listInstruments } from "@/services/instrument-service";
import { InstrumentTable } from "@/components/features/instruments/InstrumentTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instrumen — CVI",
};

/**
 * Halaman daftar instrumen — Server Component.
 *
 * @returns Halaman dengan tabel daftar instrumen, atau pesan error jika API gagal.
 */
export default async function InstrumentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/my-assignments");

  let instruments;
  let fetchError: string | null = null;

  try {
    instruments = await listInstruments(session.accessToken);
  } catch (err) {
    instruments = [];
    fetchError = err instanceof Error ? err.message : "Gagal mengambil data instrumen dari server.";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Instrumen</h1>
        <Link
          href="/instruments/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Buat Instrumen
        </Link>
      </div>
      {fetchError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Gagal memuat instrumen:</strong> {fetchError}
        </div>
      ) : (
        <InstrumentTable instruments={instruments} />
      )}
    </div>
  );
}
