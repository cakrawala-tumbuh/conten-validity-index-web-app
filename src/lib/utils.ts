/**
 * Utilitas umum untuk CVI Web App.
 *
 * Berisi helper function yang digunakan di berbagai bagian aplikasi.
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  CVI_FEW_EXPERTS_MAX,
  CVI_THRESHOLD_FEW_EXPERTS,
  CVI_THRESHOLD_MANY_EXPERTS,
} from "@/constants";

/**
 * Menggabungkan Tailwind CSS class names dengan penanganan konflik yang benar.
 *
 * Menggunakan `clsx` untuk kondisional class dan `tailwind-merge` untuk
 * menghindari konflik antar Tailwind utility class.
 *
 * @param inputs - Daftar class names yang akan digabungkan.
 * @returns String class names yang sudah digabungkan.
 *
 * @example
 * ```ts
 * cn("px-2 py-1", isActive && "bg-blue-500", "px-4") // "py-1 bg-blue-500 px-4"
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Menginterpretasikan nilai CVI menjadi kategori verbal.
 *
 * Berdasarkan konvensi Lynn (1986):
 * - CVI >= 0.78 untuk expert >= 6: valid
 * - CVI >= 0.83 untuk expert 3–5: valid
 * - CVI di bawah threshold: tidak valid
 *
 * @param cvi - Nilai CVI antara 0.0 dan 1.0.
 * @param nExperts - Jumlah total expert penilai.
 * @returns `"valid"` atau `"tidak-valid"`.
 *
 * @example
 * ```ts
 * interpretCVI(0.85, 7); // "valid"
 * interpretCVI(0.60, 7); // "tidak-valid"
 * ```
 */
export function interpretCVI(cvi: number, nExperts: number): "valid" | "tidak-valid" {
  const threshold =
    nExperts <= CVI_FEW_EXPERTS_MAX ? CVI_THRESHOLD_FEW_EXPERTS : CVI_THRESHOLD_MANY_EXPERTS;
  return cvi >= threshold ? "valid" : "tidak-valid";
}

/**
 * Memformat tanggal ISO string menjadi format lokal Indonesia.
 *
 * @param isoString - Tanggal dalam format ISO 8601.
 * @returns String tanggal dalam format "DD MMMM YYYY, HH:mm".
 *
 * @example
 * ```ts
 * formatDate("2026-05-30T10:00:00"); // "30 Mei 2026, 10:00"
 * ```
 */
export function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

/**
 * Memicu unduhan berkas dari sebuah `Blob` di sisi browser secara andal.
 *
 * Membuat object URL, menambahkan anchor tersembunyi ke `document.body`,
 * lalu mengkliknya. Anchor sengaja DILAMPIRKAN ke DOM (bukan elemen lepas)
 * dan object URL DIBATALKAN secara tertunda — keduanya diperlukan agar
 * unduhan benar-benar terpicu di sebagian browser/lingkungan produksi.
 * Mengklik anchor lepas atau memanggil `revokeObjectURL` secara sinkron
 * tepat setelah `click()` dapat membatalkan unduhan sebelum dimulai, sehingga
 * tombol seolah "tidak melakukan apa-apa" tanpa melempar error.
 *
 * @param blob - Konten berkas yang akan diunduh.
 * @param filename - Nama berkas yang disarankan kepada browser.
 *
 * @example
 * ```ts
 * triggerBlobDownload(new Blob(["{}"], { type: "application/json" }), "data.json");
 * ```
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Tunda pembatalan object URL agar browser sempat memulai unduhan terlebih
  // dahulu; membatalkannya pada frame yang sama dengan click() dapat
  // menggagalkan unduhan secara diam-diam.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
}

/**
 * Memformat nilai CVI sebagai persentase dengan dua desimal.
 *
 * @param value - Nilai antara 0.0 dan 1.0.
 * @returns String persentase, misalnya "85.00%".
 *
 * @example
 * ```ts
 * formatCVI(0.8571); // "85.71%"
 * ```
 */
export function formatCVI(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}
