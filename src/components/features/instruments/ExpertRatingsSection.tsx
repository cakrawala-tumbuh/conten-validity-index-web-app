/**
 * Komponen seksi penilaian per expert untuk tampilan admin.
 *
 * Menampilkan tabel penilaian setiap expert beserta skor relevansi per item,
 * catatan, dan status penilaian. Item yang belum dinilai ditampilkan secara
 * eksplisit agar admin dapat memantau kelengkapan penilaian.
 */
"use client";

import { useState } from "react";
import { ClipboardList, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import type { ExpertRatingSummary, InstrumentExpertRatingsResponse } from "@/types/cvi";
import { TableInfoTooltip } from "@/components/ui/Tooltip";

/**
 * Props untuk ExpertRatingsSection.
 */
interface ExpertRatingsSectionProps {
  instrumentId: string;
}

/** Label status assignment dalam Bahasa Indonesia. */
const STATUS_LABELS: Record<string, string> = {
  pending: "Belum Mulai",
  in_progress: "Sedang Berjalan",
  completed: "Selesai",
};

/** Warna badge status assignment. */
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  in_progress: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
};

/** Label skor relevansi 1–4. */
const SCORE_LABELS: Record<number, string> = {
  1: "Tidak Relevan",
  2: "Kurang Relevan",
  3: "Cukup Relevan",
  4: "Sangat Relevan",
};

/** Warna latar skor relevansi 1–4. */
const SCORE_COLORS: Record<number, string> = {
  1: "bg-red-100 text-red-700",
  2: "bg-orange-100 text-orange-700",
  3: "bg-blue-100 text-blue-700",
  4: "bg-green-100 text-green-700",
};

/**
 * Kartu penilaian satu expert yang dapat dibuka/tutup (accordion).
 *
 * @param props.expert - Data penilaian expert.
 * @param props.defaultOpen - Apakah kartu dibuka secara default.
 * @returns Kartu accordion penilaian expert.
 */
const ExpertCard = ({
  expert,
  defaultOpen,
}: {
  expert: ExpertRatingSummary;
  defaultOpen: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  const ratedCount = expert.ratings.filter((r) => r.relevance_score !== null).length;
  const relevantCount = expert.ratings.filter((r) => r.is_relevant === true).length;
  const totalCount = expert.ratings.length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Header accordion */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
            {expert.expert_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{expert.expert_name}</p>
            {expert.institution && (
              <p className="text-xs text-gray-500 truncate">{expert.institution}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <span className="text-xs text-gray-500">
            {ratedCount}/{totalCount} dinilai &middot; {relevantCount} relevan
          </span>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[expert.status] ?? "bg-gray-100 text-gray-600"}`}
          >
            {STATUS_LABELS[expert.status] ?? expert.status}
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Tabel penilaian per item */}
      {open && (
        <div className="border-t border-gray-200">
          <div className="flex items-center gap-1.5 px-4 py-2.5">
            <p className="text-xs font-medium text-gray-600">Rincian Penilaian per Item</p>
            <TableInfoTooltip description="Rincian skor relevansi (1–4) yang diberikan expert ini untuk tiap item beserta catatannya. Item yang belum dinilai ditampilkan abu-abu." />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    No.
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Konten Item
                  </th>
                  <th className="w-40 px-4 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Skor
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Catatan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expert.ratings.map((rating) => (
                  <tr
                    key={rating.item_id}
                    className={
                      rating.relevance_score === null ? "bg-gray-50/60" : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-4 py-2.5 text-sm text-gray-400 text-center">
                      {rating.sequence_number}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-800">{rating.content}</td>
                    <td className="px-4 py-2.5 text-center">
                      {rating.relevance_score !== null ? (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${SCORE_COLORS[rating.relevance_score] ?? ""}`}
                          title={SCORE_LABELS[rating.relevance_score]}
                        >
                          {rating.relevance_score} — {SCORE_LABELS[rating.relevance_score]}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Belum dinilai</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">
                      {rating.notes ?? <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Seksi penilaian per expert instrumen (admin only).
 *
 * Mengambil data dari API saat tombol ditekan, lalu menampilkan accordion
 * per expert berisi skor relevansi setiap item beserta catatannya.
 *
 * @param props.instrumentId - ID instrumen yang akan ditampilkan.
 * @returns Komponen seksi penilaian expert interaktif.
 */
export const ExpertRatingsSection = ({ instrumentId }: ExpertRatingsSectionProps) => {
  const [data, setData] = useState<InstrumentExpertRatingsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Mengambil data penilaian expert dari API.
   */
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/instruments/${instrumentId}/expert-ratings`);
      if (!resp.ok) {
        const json = await resp.json().catch(() => ({}));
        throw new Error(json.detail ?? `Gagal memuat penilaian (${resp.status})`);
      }
      const json: InstrumentExpertRatingsResponse = await resp.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat penilaian expert.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Memuat...
            </>
          ) : (
            <>
              <ClipboardList className="h-4 w-4" />
              {data ? "Muat Ulang" : "Tampilkan Penilaian"}
            </>
          )}
        </button>

        {data && (
          <span className="text-sm text-gray-500">
            {data.n_experts} expert &middot; {data.n_items} item
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {!data && !loading && (
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            Klik &ldquo;Tampilkan Penilaian&rdquo; untuk melihat detail penilaian setiap expert.
          </p>
        </div>
      )}

      {data && data.experts.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
          <p className="text-sm text-gray-500">Belum ada expert yang di-assign ke instrumen ini.</p>
        </div>
      )}

      {data && data.experts.length > 0 && (
        <div className="space-y-3">
          {data.experts.map((expert, idx) => (
            <ExpertCard key={expert.assignment_id} expert={expert} defaultOpen={idx === 0} />
          ))}
        </div>
      )}
    </div>
  );
};
