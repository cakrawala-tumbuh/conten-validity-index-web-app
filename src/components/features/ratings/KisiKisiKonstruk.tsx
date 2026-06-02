/**
 * Komponen tampilan kisi-kisi konstruk instrumen untuk expert.
 *
 * Menampilkan tabel referensi berisi dimensi/domain instrumen beserta definisi
 * konstruk (kolom D), contoh indikator perilaku (kolom E), dan referensi teori
 * (kolom F). Komponen ini ditempatkan di atas tabel penilaian agar expert dapat
 * memahami konstruk yang diukur sebelum memberikan skor relevansi.
 */
import type { DomainResponse } from "@/types/domain";

/**
 * Props untuk KisiKisiKonstruk.
 */
interface KisiKisiKonstrukProps {
  domains: DomainResponse[];
}

/**
 * Menentukan apakah sebuah domain memiliki isi kisi-kisi konstruk.
 *
 * @param domain - Domain yang akan diperiksa.
 * @returns `true` bila salah satu kolom D/E/F terisi.
 */
const hasKisiKisi = (domain: DomainResponse): boolean =>
  Boolean(
    domain.construct_definition || domain.behavioral_indicator_example || domain.theory_reference,
  );

/**
 * Tabel kisi-kisi konstruk sebagai referensi bagi expert saat menilai.
 *
 * Hanya menampilkan domain yang memiliki minimal satu kolom kisi-kisi terisi.
 * Bila tidak ada domain yang memiliki kisi-kisi, komponen tidak dirender.
 *
 * @param props.domains - Daftar domain/dimensi instrumen.
 * @returns Tabel kisi-kisi konstruk, atau `null` bila tidak ada data.
 */
export const KisiKisiKonstruk = ({ domains }: KisiKisiKonstrukProps) => {
  const relevantDomains = domains.filter(hasKisiKisi);

  if (relevantDomains.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
        <p className="text-sm font-semibold text-gray-800">Kisi-Kisi Konstruk</p>
        <p className="mt-0.5 text-xs text-gray-500">
          Gunakan tabel berikut sebagai acuan konstruk yang diukur sebelum memberi penilaian.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                No.
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Dimensi
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Definisi Konstruk
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Contoh Indikator Perilaku
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Referensi Teori
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {relevantDomains.map((domain, idx) => (
              <tr key={domain.id} className="align-top">
                <td className="px-4 py-3 text-sm text-gray-500 text-center">{idx + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{domain.name}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-pre-line">
                  {domain.construct_definition ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-pre-line">
                  {domain.behavioral_indicator_example ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-pre-line">
                  {domain.theory_reference ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
