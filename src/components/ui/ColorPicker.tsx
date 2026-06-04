/**
 * Komponen pemilih warna (color picker) yang ramah pengguna.
 *
 * Menyediakan tiga cara memilih warna latar dimensi:
 * 1. Klik salah satu swatch warna preset (pastel, kontras teks tetap terbaca).
 * 2. Picker warna native (`input[type=color]`) untuk warna kustom.
 * 3. Input teks kode hex `#RRGGBB`.
 *
 * Nilai dikelola sebagai string hex `#RRGGBB`, atau `null` bila tidak ada warna.
 */
"use client";

import { useState } from "react";
import { Check, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Daftar warna preset pastel yang aman untuk latar (teks gelap tetap terbaca).
 */
const PRESET_COLORS: readonly string[] = [
  "#FDE68A",
  "#FECACA",
  "#FED7AA",
  "#A7F3D0",
  "#BFDBFE",
  "#C7D2FE",
  "#DDD6FE",
  "#FBCFE8",
  "#F5D0FE",
  "#E5E7EB",
];

/**
 * Warna default untuk picker native ketika belum ada warna yang dipilih.
 */
const DEFAULT_PICKER_COLOR = "#BFDBFE";

/**
 * Pola validasi warna hex 6 digit (mis. `#FDE68A`).
 */
const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

/**
 * Props untuk ColorPicker.
 */
interface ColorPickerProps {
  /** Warna terpilih saat ini dalam format hex `#RRGGBB`, atau null. */
  value: string | null;
  /** Callback ketika warna berubah; menerima hex valid atau null bila dikosongkan. */
  onChange: (value: string | null) => void;
}

/**
 * Pemilih warna latar dimensi dengan swatch preset, picker native, dan input hex.
 *
 * @param props.value - Warna terpilih saat ini (hex `#RRGGBB`) atau null.
 * @param props.onChange - Dipanggil saat warna berubah dengan hex valid atau null.
 * @returns Antarmuka pemilih warna interaktif.
 */
export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const [hexInput, setHexInput] = useState<string>(value ?? "");
  const [prevValue, setPrevValue] = useState<string | null>(value);

  // Sinkronkan input teks saat nilai diubah dari luar (mis. mode edit dibuka),
  // memakai pola "menyesuaikan state saat render" agar tidak memicu render berantai.
  if (value !== prevValue) {
    setPrevValue(value);
    setHexInput(value ?? "");
  }

  const normalizedValue = value && HEX_PATTERN.test(value) ? value : null;

  /**
   * Menangani perubahan pada input teks hex.
   *
   * Menambahkan prefix `#` bila perlu, lalu meneruskan nilai hanya jika valid
   * atau kosong (mengosongkan warna).
   *
   * @param raw - Nilai mentah dari input teks.
   */
  const handleHexChange = (raw: string) => {
    const next = raw === "" || raw.startsWith("#") ? raw : `#${raw}`;
    setHexInput(next);
    if (next === "") {
      onChange(null);
    } else if (HEX_PATTERN.test(next)) {
      onChange(next);
    }
  };

  return (
    <div className="space-y-2">
      {/* Swatch preset + tombol "tanpa warna" */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(null)}
          title="Tanpa warna"
          aria-label="Tanpa warna"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md border bg-white transition",
            normalizedValue === null
              ? "border-blue-500 ring-2 ring-blue-200"
              : "border-gray-300 hover:border-gray-400",
          )}
        >
          <Ban className="h-3.5 w-3.5 text-gray-400" />
        </button>
        {PRESET_COLORS.map((color) => {
          const selected = normalizedValue?.toUpperCase() === color.toUpperCase();
          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              title={color}
              aria-label={`Pilih warna ${color}`}
              style={{ backgroundColor: color }}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md border transition",
                selected
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-black/10 hover:border-black/30",
              )}
            >
              {selected && <Check className="h-3.5 w-3.5 text-gray-800" />}
            </button>
          );
        })}
      </div>

      {/* Picker native + input hex + pratinjau */}
      <div className="flex items-center gap-2">
        <label className="relative inline-flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-gray-300">
          <span
            className="absolute inset-0"
            style={{ backgroundColor: normalizedValue ?? "#ffffff" }}
          />
          <input
            type="color"
            value={normalizedValue ?? DEFAULT_PICKER_COLOR}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Pilih warna kustom"
          />
        </label>
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#RRGGBB"
          maxLength={7}
          className="w-28 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 font-mono text-xs text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <span className="text-xs text-gray-400">
          {normalizedValue ? "Warna latar dimensi" : "Tanpa warna latar"}
        </span>
      </div>
    </div>
  );
};
