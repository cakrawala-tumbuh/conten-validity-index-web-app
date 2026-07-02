/**
 * Komponen seksi kalkulasi dan tampilan hasil CVI instrumen.
 *
 * Menampilkan tombol hitung CVI, tabel hasil I-CVI per item, nilai S-CVI/Ave
 * dan S-CVI/UA, serta tombol export ke Excel.
 */
"use client";

import { useState } from "react";
import { BarChart3, Download, FileText, RefreshCw } from "lucide-react";
import {
  CVI_THRESHOLD_MANY_EXPERTS,
  CVI_THRESHOLD_FEW_EXPERTS,
  CVI_FEW_EXPERTS_MAX,
} from "@/constants";
import type { CVIResult } from "@/types/cvi";
import { TableInfoTooltip } from "@/components/ui/Tooltip";

/**
 * Props untuk CVISection.
 */
interface CVISectionProps {
  instrumentId: string;
  instrumentName: string;
}

/**
 * Menentukan apakah nilai I-CVI valid berdasarkan jumlah expert.
 *
 * @param icvi - Nilai I-CVI (0–1).
 * @param nExperts - Jumlah expert.
 * @returns `true` jika nilai memenuhi threshold.
 */
function isValid(icvi: number, nExperts: number): boolean {
  const threshold =
    nExperts <= CVI_FEW_EXPERTS_MAX ? CVI_THRESHOLD_FEW_EXPERTS : CVI_THRESHOLD_MANY_EXPERTS;
  return icvi >= threshold;
}

/**
 * Seksi kalkulasi dan hasil CVI instrumen.
 *
 * Mengambil hasil CVI dari API saat tombol ditekan, menampilkan tabel I-CVI
 * per item dengan badge valid/tidak valid, serta ringkasan S-CVI.
 *
 * @param props.instrumentId - ID instrumen.
 * @param props.instrumentName - Nama instrumen untuk nama file export.
 * @returns Komponen seksi CVI interaktif.
 */
export const CVISection = ({ instrumentId, instrumentName }: CVISectionProps) => {
  const [result, setResult] = useState<CVIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Menghitung dan mengambil hasil CVI dari API.
   */
  const calculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/instruments/${instrumentId}/cvi`);
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menghitung CVI (${resp.status})`);
      }
      const data: CVIResult = await resp.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghitung CVI.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mengunduh hasil CVI sebagai file Excel.
   */
  const exportExcel = async () => {
    setExporting(true);
    setError(null);
    try {
      const resp = await fetch(`/api/instruments/${instrumentId}/cvi/export`);
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal mengekspor CVI (${resp.status})`);
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CVI-${instrumentName.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengekspor CVI.");
    } finally {
      setExporting(false);
    }
  };

  /**
   * Mengunduh hasil CVI sebagai file PDF.
   */
  const exportPdf = async () => {
    setExportingPdf(true);
    setError(null);
    try {
      const resp = await fetch(`/api/instruments/${instrumentId}/cvi/export/pdf`);
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal mengekspor PDF (${resp.status})`);
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CVI-${instrumentName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengekspor PDF.");
    } finally {
      setExportingPdf(false);
    }
  };

  const validItemsCount = result ? result.items.filter((item) => item.is_valid).length : 0;

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={calculate}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Menghitung...
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4" />
              {result ? "Hitung Ulang" : "Hitung CVI"}
            </>
          )}
        </button>
        {result && (
          <button
            type="button"
            onClick={exportExcel}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Mengekspor..." : "Export Excel"}
          </button>
        )}
        {result && (
          <button
            type="button"
            onClick={exportPdf}
            disabled={exportingPdf}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            {exportingPdf ? "Mengekspor..." : "Export PDF"}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {!result && !loading && (
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
          <BarChart3 className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            Klik &ldquo;Hitung CVI&rdquo; untuk menampilkan hasil kalkulasi.
          </p>
          <p className="text-xs text-gray-400">
            Pastikan semua expert sudah menyelesaikan penilaian.
          </p>
        </div>
      )}

      {result && (
        <>
          {/* Ringkasan S-CVI */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-xs text-gray-500">S-CVI/Ave</p>
              <p
                className={`mt-1 text-2xl font-bold ${result.s_cvi_ave >= 0.9 ? "text-green-600" : result.s_cvi_ave >= 0.78 ? "text-yellow-600" : "text-red-600"}`}
              >
                {result.s_cvi_ave.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">Average</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-xs text-gray-500">S-CVI/UA</p>
              <p
                className={`mt-1 text-2xl font-bold ${result.s_cvi_ua >= 0.8 ? "text-green-600" : result.s_cvi_ua >= 0.6 ? "text-yellow-600" : "text-red-600"}`}
              >
                {result.s_cvi_ua.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">Universal Agreement</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-xs text-gray-500">Item Valid</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {validItemsCount}/{result.n_items}
              </p>
              <p className="text-xs text-gray-400">item</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-xs text-gray-500">Expert</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{result.n_experts}</p>
              <p className="text-xs text-gray-400">penilai</p>
            </div>
          </div>

          {/* Tabel I-CVI per item */}
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700">Hasil I-CVI per Item</p>
              <TableInfoTooltip description="Menampilkan nilai I-CVI (Item-level Content Validity Index) tiap item: jumlah expert yang menilai relevan (skor 3–4), nilai I-CVI = jumlah relevan dibagi total expert, dan status valid bila memenuhi ambang batas (≥0,78 untuk ≥6 expert; ≥0,83 untuk 3–5 expert)." />
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Konten Item
                  </th>
                  <th className="w-28 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Relevan
                  </th>
                  <th className="w-24 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    I-CVI
                  </th>
                  <th className="w-28 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.items.map((item) => {
                  const valid = isValid(item.i_cvi, result.n_experts);
                  return (
                    <tr key={item.item_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">
                        {item.sequence_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.content}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">
                        {item.n_relevant}/{result.n_experts}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-sm font-semibold ${valid ? "text-green-600" : "text-red-600"}`}
                        >
                          {item.i_cvi.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${valid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {valid ? "Valid" : "Tidak Valid"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
