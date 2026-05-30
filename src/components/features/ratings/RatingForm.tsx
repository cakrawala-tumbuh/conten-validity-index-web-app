/**
 * Komponen form penilaian item instrumen oleh expert.
 *
 * Menampilkan tabel item dengan radio button skala 1–4 dan kolom catatan opsional.
 * Mendukung bulk submit semua penilaian dan indikasi progres pengisian.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ItemResponse } from "@/types/item";
import type { RatingResponse } from "@/types/rating";
import type { AssignmentResponse } from "@/types/expert-assignment";

/**
 * Label untuk setiap nilai skala Likert yang digunakan dalam CVI.
 */
const SCORE_LABELS: Record<number, string> = {
  1: "Tidak Relevan",
  2: "Kurang Relevan",
  3: "Cukup Relevan",
  4: "Sangat Relevan",
};

/**
 * State penilaian per item, diidentifikasi oleh item ID.
 */
interface RatingState {
  score: 1 | 2 | 3 | 4 | null;
  notes: string;
}

/**
 * Props untuk RatingForm.
 */
interface RatingFormProps {
  assignment: AssignmentResponse;
  items: ItemResponse[];
  existingRatings: RatingResponse[];
}

/**
 * Form penilaian instrumen oleh expert.
 *
 * Menampilkan setiap item instrumen dengan pilihan skor 1–4 dan kolom catatan.
 * Mendeteksi apakah sudah ada penilaian sebelumnya untuk auto-fill form.
 * Submit mengirim semua penilaian sekaligus (bulk) ke API.
 *
 * @param props.assignment - Data assignment milik expert.
 * @param props.items - Daftar item instrumen yang akan dinilai.
 * @param props.existingRatings - Penilaian yang sudah ada (untuk edit mode).
 * @returns Form penilaian interaktif.
 */
export const RatingForm = ({ assignment, items, existingRatings }: RatingFormProps) => {
  const router = useRouter();

  const initialState = (): Record<string, RatingState> => {
    const state: Record<string, RatingState> = {};
    for (const item of items) {
      const existing = existingRatings.find((r) => r.item_id === item.id);
      state[item.id] = {
        score: existing ? (existing.relevance_score as 1 | 2 | 3 | 4) : null,
        notes: existing?.notes ?? "",
      };
    }
    return state;
  };

  const [ratings, setRatings] = useState<Record<string, RatingState>>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const filledCount = Object.values(ratings).filter((r) => r.score !== null).length;
  const isComplete = filledCount === items.length;

  /**
   * Memperbarui skor atau catatan untuk satu item tertentu.
   *
   * @param itemId - ID item yang diperbarui.
   * @param field - Field yang diperbarui (`score` atau `notes`).
   * @param value - Nilai baru.
   */
  const updateRating = (itemId: string, field: keyof RatingState, value: string | number) => {
    setRatings((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  /**
   * Menangani pengiriman semua penilaian (bulk submit).
   *
   * Memvalidasi semua item sudah dinilai sebelum mengirim.
   *
   * @param e - Event form submission.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isComplete) {
      setError("Semua item harus dinilai sebelum submit.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        ratings: items.map((item) => ({
          item_id: item.id,
          relevance_score: ratings[item.id].score as number,
          notes: ratings[item.id].notes.trim() || undefined,
        })),
      };

      const resp = await fetch(`/api/assignments/${assignment.id}/ratings/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menyimpan penilaian (${resp.status})`);
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-lg font-semibold text-green-800">Penilaian berhasil disimpan!</p>
        <p className="mt-2 text-sm text-green-700">
          Semua {items.length} item telah dinilai. Terima kasih atas kontribusi Anda.
        </p>
        <button
          type="button"
          onClick={() => router.push("/my-assignments")}
          className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
        >
          Kembali ke Daftar Penilaian
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-6 py-3">
        <span className="text-sm text-gray-600">
          Progres:{" "}
          <span className={`font-semibold ${isComplete ? "text-green-600" : "text-blue-600"}`}>
            {filledCount} / {items.length}
          </span>{" "}
          item sudah dinilai
        </span>
        {isComplete && (
          <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
            Siap submit
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Rating table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                No.
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Konten Item
              </th>
              <th className="w-64 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                Skor Relevansi
              </th>
              <th className="w-48 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Catatan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
              const current = ratings[item.id];
              return (
                <tr key={item.id} className={current.score !== null ? "bg-white" : "bg-yellow-50"}>
                  <td className="px-4 py-4 text-sm text-gray-500 text-center align-top">
                    {item.sequence_number}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <p className="text-sm text-gray-900">{item.content}</p>
                    {item.dimension_name && (
                      <p className="mt-1 text-xs text-gray-400">Dimensi: {item.dimension_name}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col gap-1.5">
                      {([1, 2, 3, 4] as const).map((score) => (
                        <label
                          key={score}
                          className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition ${
                            current.score === score
                              ? "bg-blue-100 text-blue-800 font-medium"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`score-${item.id}`}
                            value={score}
                            checked={current.score === score}
                            onChange={() => updateRating(item.id, "score", score)}
                            className="accent-blue-600"
                          />
                          <span>
                            {score} — {SCORE_LABELS[score]}
                          </span>
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <textarea
                      value={current.notes}
                      onChange={(e) => updateRating(item.id, "notes", e.target.value)}
                      placeholder="Catatan opsional..."
                      rows={3}
                      className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !isComplete}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Semua Penilaian"}
        </button>
      </div>
    </form>
  );
};
