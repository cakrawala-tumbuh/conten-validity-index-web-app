/**
 * Halaman detail instrumen.
 *
 * Menampilkan informasi lengkap instrumen dengan tab: Informasi (edit/delete),
 * Item (CRUD), Expert (manajemen assignment), dan Hasil CVI (kalkulasi + export).
 * Hanya dapat diakses oleh admin.
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInstrument } from "@/services/instrument-service";
import { listItems } from "@/services/item-service";
import { listAssignments } from "@/services/assignment-service";
import { listUsers } from "@/services/user-service";
import { listDimensions } from "@/services/dimension-service";
import { InstrumentDetailTabs } from "@/components/features/instruments/InstrumentDetailTabs";
import { INSTRUMENT_STATUS_LABELS } from "@/constants";
import type { Metadata } from "next";

/**
 * Props halaman detail instrumen.
 */
interface InstrumentDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Menghasilkan metadata halaman secara dinamis berdasarkan nama instrumen.
 *
 * @param props - Props halaman berisi params route.
 * @returns Metadata dengan judul halaman.
 */
export async function generateMetadata({ params }: InstrumentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return { title: "Detail Instrumen — CVI" };
  const instrument = await getInstrument(session.accessToken, id).catch(() => null);
  return { title: instrument ? `${instrument.name} — CVI` : "Detail Instrumen — CVI" };
}

/**
 * Halaman detail instrumen — Server Component.
 *
 * Menampilkan nama, deskripsi, versi, status, dan tabel item instrumen.
 *
 * @param props - Props halaman berisi params route dinamis.
 * @returns Halaman detail instrumen dengan daftar item.
 */
export default async function InstrumentDetailPage({ params }: InstrumentDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/my-assignments");

  const { id } = await params;

  const [instrument, items, assignments, allUsers, dimensions] = await Promise.all([
    getInstrument(session.accessToken, id).catch(() => null),
    listItems(session.accessToken, id).catch(() => []),
    listAssignments(session.accessToken, id).catch(() => []),
    listUsers(session.accessToken, { limit: 200 }).catch(() => []),
    listDimensions(session.accessToken, id).catch(() => []),
  ]);

  if (!instrument) notFound();

  const experts = allUsers.filter((u) => u.role === "expert" && u.is_active);

  const statusLabel = INSTRUMENT_STATUS_LABELS[instrument.status] ?? instrument.status;

  const statusColor: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    active: "bg-green-100 text-green-700",
    closed: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/instruments" className="text-sm text-gray-500 hover:text-gray-700">
          ← Kembali
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">{instrument.name}</h1>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[instrument.status] ?? "bg-gray-100 text-gray-700"}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Tab content */}
      <InstrumentDetailTabs
        instrument={instrument}
        items={items}
        assignments={assignments}
        experts={experts}
        dimensions={dimensions}
      />
    </div>
  );
}
