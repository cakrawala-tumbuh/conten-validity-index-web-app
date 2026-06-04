/**
 * Komponen pemilih banyak bidang keahlian (multi-select berbasis checkbox).
 *
 * Menampilkan daftar bidang keahlian pada daftar master sebagai opsi yang dapat
 * dicentang. Dipakai pada form profil expert maupun halaman pengelolaan
 * pengguna oleh admin.
 */
"use client";

import type { ExpertiseAreaResponse } from "@/types/expertise-area";

/**
 * Props untuk ExpertiseAreaSelect.
 */
interface ExpertiseAreaSelectProps {
  /** Daftar seluruh bidang keahlian yang dapat dipilih. */
  options: ExpertiseAreaResponse[];
  /** ID bidang keahlian yang sedang terpilih. */
  selectedIds: string[];
  /** Callback saat pilihan berubah, menerima daftar ID terbaru. */
  onChange: (ids: string[]) => void;
  /** Nonaktifkan interaksi (mis. saat menyimpan). */
  disabled?: boolean;
}

/**
 * Pemilih banyak bidang keahlian berbasis checkbox.
 *
 * @param props.options - Daftar bidang keahlian yang tersedia.
 * @param props.selectedIds - ID yang sedang terpilih.
 * @param props.onChange - Callback perubahan pilihan.
 * @param props.disabled - Status nonaktif.
 * @returns Daftar checkbox bidang keahlian.
 */
export const ExpertiseAreaSelect = ({
  options,
  selectedIds,
  onChange,
  disabled = false,
}: ExpertiseAreaSelectProps) => {
  /**
   * Menambah/menghapus satu ID dari daftar terpilih.
   *
   * @param id - ID bidang keahlian yang di-toggle.
   */
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (options.length === 0) {
    return (
      <p className="text-xs text-gray-400">
        Belum ada bidang keahlian. Hubungi admin untuk menambahkannya.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Bidang keahlian">
      {options.map((option) => {
        const checked = selectedIds.includes(option.id);
        return (
          <label
            key={option.id}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
              checked
                ? "border-blue-300 bg-blue-100 text-blue-800"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(option.id)}
              disabled={disabled}
              className="accent-blue-600"
            />
            {option.name}
          </label>
        );
      })}
    </div>
  );
};
