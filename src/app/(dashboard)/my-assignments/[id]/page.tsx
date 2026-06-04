/**
 * Halaman form penilaian untuk satu assignment expert.
 *
 * Mengambil data assignment, instrumen, item, dan penilaian yang sudah ada,
 * lalu menampilkan form penilaian interaktif untuk expert mengisi skor relevansi
 * setiap item instrumen.
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getMyAssignments } from "@/services/assignment-service";
import { getInstrument } from "@/services/instrument-service";
import { listItems } from "@/services/item-service";
import { getRatings } from "@/services/rating-service";
import { listDomains } from "@/services/domain-service";
import { RatingForm } from "@/components/features/ratings/RatingForm";
import { KisiKisiKonstruk } from "@/components/features/ratings/KisiKisiKonstruk";
import { ASSIGNMENT_STATUS_LABELS, INSTRUMENT_STATUS_LABELS } from "@/constants";
import type { Metadata } from "next";

/**
 * Props halaman penilaian assignment.
 */
interface RatingPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Menghasilkan metadata halaman secara dinamis.
 *
 * @param props - Props halaman berisi params route.
 * @returns Metadata dengan judul halaman.
 */
export async function generateMetadata({ params }: RatingPageProps): Promise<Metadata> {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return { title: "Penilaian — CVI" };

  const assignments = await getMyAssignments(session.accessToken).catch(() => []);
  const assignment = assignments.find((a) => a.id === id);
  if (!assignment) return { title: "Penilaian — CVI" };

  const instrument = await getInstrument(session.accessToken, assignment.instrument_id).catch(
    () => null,
  );
  return { title: instrument ? `Nilai: ${instrument.name} — CVI` : "Penilaian — CVI" };
}

/**
 * Halaman form penilaian assignment — Server Component.
 *
 * Memvalidasi assignment milik pengguna yang login, kemudian menyiapkan data
 * instrumen, item, dan penilaian yang sudah ada untuk diteruskan ke RatingForm.
 *
 * @param props - Props halaman berisi params route dinamis.
 * @returns Halaman form penilaian lengkap.
 */
export default async function RatingPage({ params }: RatingPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const { id } = await params;

  // Ambil semua assignments milik user ini, lalu cari yang sesuai
  const assignments = await getMyAssignments(session.accessToken).catch(() => []);
  const assignment = assignments.find((a) => a.id === id);

  if (!assignment) notFound();

  const [instrument, items, existingRatings, domains] = await Promise.all([
    getInstrument(session.accessToken, assignment.instrument_id).catch(() => null),
    listItems(session.accessToken, assignment.instrument_id).catch(() => []),
    getRatings(session.accessToken, id).catch(() => []),
    listDomains(session.accessToken, assignment.instrument_id).catch(() => []),
  ]);

  if (!instrument) notFound();

  const instrumentStatusLabel = INSTRUMENT_STATUS_LABELS[instrument.status] ?? instrument.status;
  const assignmentStatusLabel = ASSIGNMENT_STATUS_LABELS[assignment.status] ?? assignment.status;

  const statusColor: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    active: "bg-green-100 text-green-700",
    closed: "bg-red-100 text-red-700",
  };

  const assignmentStatusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/my-assignments" className="text-sm text-gray-500 hover:text-gray-700">
          ← Kembali
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">{instrument.name}</h1>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[instrument.status] ?? "bg-gray-100 text-gray-700"}`}
        >
          {instrumentStatusLabel}
        </span>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${assignmentStatusColor[assignment.status] ?? "bg-gray-100 text-gray-700"}`}
        >
          {assignmentStatusLabel}
        </span>
      </div>

      {/* Info instrumen */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-2">
        {instrument.description && (
          <p className="text-sm text-gray-600">{instrument.description}</p>
        )}
        <div className="flex gap-6 text-xs text-gray-500">
          <span>Versi: {instrument.version}</span>
          <span>{items.length} item</span>
          {assignment.deadline && (
            <span>
              Tenggat:{" "}
              {new Date(assignment.deadline).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Instruksi penilaian */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4">
        <p className="text-sm font-medium text-blue-800">Petunjuk Penilaian</p>
        <ul className="mt-2 space-y-1 text-xs text-blue-700 list-disc list-inside">
          <li>Nilai setiap item berdasarkan relevansinya dengan konstruk yang diukur.</li>
          <li>
            Skala: <strong>1</strong> = Tidak Relevan, <strong>2</strong> = Kurang Relevan,{" "}
            <strong>3</strong> = Cukup Relevan, <strong>4</strong> = Sangat Relevan.
          </li>
          <li>Semua item wajib dinilai sebelum dapat submit.</li>
          <li>
            Kolom catatan <strong>wajib diisi</strong> bila skor yang diberikan{" "}
            <strong>1 (Tidak Relevan)</strong> atau <strong>2 (Kurang Relevan)</strong>; opsional
            untuk skor lainnya.
          </li>
        </ul>
      </div>

      {/* Kisi-kisi konstruk sebagai acuan expert, ditempatkan di atas tabel penilaian */}
      <KisiKisiKonstruk domains={domains} />

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">Instrumen ini belum memiliki item untuk dinilai.</p>
        </div>
      ) : (
        <RatingForm
          assignment={assignment}
          items={items}
          existingRatings={existingRatings}
          domains={domains}
        />
      )}
    </div>
  );
}
