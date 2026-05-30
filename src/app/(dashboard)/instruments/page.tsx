/**
 * Halaman daftar instrumen untuk admin.
 *
 * Menampilkan semua instrumen dalam tabel dengan fitur untuk
 * membuat instrumen baru, melihat detail, dan mengelola item.
 */
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
 * @returns Halaman dengan tabel daftar instrumen.
 */
export default async function InstrumentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/my-assignments");

  const instruments = await listInstruments(session.accessToken).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Instrumen</h1>
      </div>
      <InstrumentTable instruments={instruments} />
    </div>
  );
}
