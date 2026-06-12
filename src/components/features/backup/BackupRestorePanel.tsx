/**
 * Komponen panel backup dan restore database untuk admin.
 *
 * Menyediakan tombol untuk mengunduh backup seluruh data sebagai berkas JSON,
 * serta form untuk memulihkan (restore) database dari berkas backup. Restore
 * bersifat destruktif sehingga memerlukan konfirmasi eksplisit dari pengguna.
 */
"use client";

import { useState } from "react";
import { Download, Upload, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { z } from "zod";
import type { BackupData, RestoreResponse } from "@/types/backup";

/**
 * Schema Zod untuk memvalidasi struktur berkas backup sebelum dikirim ke API.
 *
 * Memastikan berkas memiliki `version`, `created_at`, dan `tables` yang berupa
 * pemetaan nama tabel ke daftar baris.
 */
const backupSchema = z.object({
  version: z.string(),
  created_at: z.string(),
  tables: z.record(z.string(), z.array(z.record(z.string(), z.unknown()))),
});

/**
 * Panel interaktif untuk mengunduh backup dan memulihkan database.
 *
 * Hanya ditampilkan pada halaman yang sudah dibatasi untuk admin. Mengunduh
 * backup melalui `GET /api/backup` dan memulihkan melalui `POST /api/backup/restore`.
 *
 * @returns Komponen panel backup & restore.
 */
export const BackupRestorePanel = () => {
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RestoreResponse | null>(null);

  /**
   * Mengunduh backup seluruh database sebagai berkas JSON.
   */
  const downloadBackup = async () => {
    setDownloading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch("/api/backup");
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal mengunduh backup (${resp.status}).`);
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `cvi-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunduh backup.");
    } finally {
      setDownloading(false);
    }
  };

  /**
   * Menangani pemilihan berkas backup dari input file.
   *
   * @param event - Event perubahan input file.
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setConfirmed(false);
    setError(null);
    setResult(null);
  };

  /**
   * Membaca, memvalidasi, dan mengirim berkas backup untuk memulihkan database.
   */
  const restoreBackup = async () => {
    if (!selectedFile) return;
    setRestoring(true);
    setError(null);
    setResult(null);
    try {
      const text = await selectedFile.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("Berkas yang dipilih bukan JSON yang valid.");
      }

      const validation = backupSchema.safeParse(parsed);
      if (!validation.success) {
        throw new Error("Struktur berkas backup tidak valid atau bukan berkas backup CVI.");
      }
      const backup: BackupData = validation.data;

      const resp = await fetch("/api/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backup),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data.detail ?? `Gagal memulihkan database (${resp.status}).`);
      }
      setResult(data as RestoreResponse);
      setSelectedFile(null);
      setConfirmed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memulihkan database.");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            {result.message} Total {result.total_rows} baris dari{" "}
            {Object.keys(result.tables_restored).length} tabel dipulihkan.
          </span>
        </div>
      )}

      {/* Kartu Backup */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-900">Unduh Backup</h2>
        <p className="mt-1 text-sm text-gray-500">
          Mengunduh seluruh data aplikasi (pengguna, instrumen, penilaian, dan lainnya) sebagai satu
          berkas JSON. Simpan berkas ini di tempat yang aman.
        </p>
        <button
          type="button"
          onClick={downloadBackup}
          disabled={downloading}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {downloading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Menyiapkan...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Unduh Backup
            </>
          )}
        </button>
      </section>

      {/* Kartu Restore */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-900">Pulihkan dari Backup</h2>
        <p className="mt-1 text-sm text-gray-500">
          Memulihkan database dari berkas backup JSON. Pilih berkas backup yang valid, lalu
          konfirmasi untuk melanjutkan.
        </p>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            <strong>Operasi destruktif.</strong> Seluruh data yang ada saat ini akan dihapus dan
            digantikan oleh data dari berkas backup. Tindakan ini tidak dapat dibatalkan.
          </span>
        </div>

        <div className="mt-4">
          <label htmlFor="backup-file" className="block text-sm font-medium text-gray-700">
            Berkas backup (.json)
          </label>
          <input
            id="backup-file"
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
          />
        </div>

        {selectedFile && (
          <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Saya memahami bahwa seluruh data saat ini akan dihapus dan digantikan.
          </label>
        )}

        <button
          type="button"
          onClick={restoreBackup}
          disabled={!selectedFile || !confirmed || restoring}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {restoring ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Memulihkan...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Pulihkan Database
            </>
          )}
        </button>
      </section>
    </div>
  );
};
