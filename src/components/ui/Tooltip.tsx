/**
 * Komponen tooltip ringan tanpa dependensi eksternal.
 *
 * Menyediakan tooltip aksesibel yang muncul saat elemen pemicu di-hover
 * (mouse) maupun di-focus (keyboard). Dibangun di atas state React sederhana
 * sehingga tidak memerlukan pustaka tambahan seperti Radix UI. Tooltip
 * dirender di bawah pemicu (`top-full`) agar tidak terpotong oleh kontainer
 * tabel yang memakai `overflow-hidden`.
 */
"use client";

import { useId, useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props untuk komponen {@link Tooltip}.
 */
interface TooltipProps {
  /** Isi penjelasan yang ditampilkan di dalam balon tooltip. */
  content: ReactNode;
  /** Elemen pemicu yang akan memunculkan tooltip saat hover/focus. */
  children: ReactNode;
  /** Class tambahan untuk balon tooltip (mis. mengatur lebar). */
  className?: string;
}

/**
 * Menampilkan balon penjelasan ketika elemen pemicu di-hover atau di-focus.
 *
 * Tooltip muncul di bawah pemicu dan otomatis menutup saat pointer keluar
 * atau focus hilang. Atribut `role="tooltip"` dan `aria-describedby`
 * dipasang agar pembaca layar dapat mengaitkan penjelasan dengan pemicunya.
 *
 * @param props - Props komponen.
 * @param props.content - Teks/elemen penjelasan yang ditampilkan.
 * @param props.children - Elemen pemicu tooltip.
 * @param props.className - Class tambahan untuk balon tooltip.
 * @returns Elemen JSX berisi pemicu beserta balon tooltip-nya.
 *
 * @example
 * ```tsx
 * <Tooltip content="Penjelasan singkat">
 *   <button type="button">?</button>
 * </Tooltip>
 * ```
 */
export const Tooltip = ({ content, children, className }: TooltipProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const tooltipId = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? tooltipId : undefined} className="inline-flex">
        {children}
      </span>
      {open && (
        <span
          role="tooltip"
          id={tooltipId}
          className={cn(
            "absolute left-0 top-full z-50 mt-1.5 w-72 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-xs font-normal leading-relaxed text-gray-100 shadow-lg",
            className,
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
};

/**
 * Props untuk komponen {@link TableInfoTooltip}.
 */
interface TableInfoTooltipProps {
  /** Penjelasan isi/fungsi tabel yang ditampilkan di dalam tooltip. */
  description: string;
  /** Label aksesibilitas untuk ikon pemicu. */
  label?: string;
}

/**
 * Ikon informasi dengan tooltip penjelasan untuk sebuah tabel.
 *
 * Ditempatkan di samping judul tabel agar pengguna dapat memahami isi dan
 * fungsi tabel dengan meng-hover atau mem-focus ikon informasi.
 *
 * @param props - Props komponen.
 * @param props.description - Penjelasan isi/fungsi tabel.
 * @param props.label - Label aksesibilitas ikon (default: "Penjelasan tabel").
 * @returns Elemen JSX berupa ikon informasi dengan tooltip.
 *
 * @example
 * ```tsx
 * <TableInfoTooltip description="Daftar seluruh instrumen penelitian." />
 * ```
 */
export const TableInfoTooltip = ({
  description,
  label = "Penjelasan tabel",
}: TableInfoTooltipProps) => {
  return (
    <Tooltip content={description}>
      <button
        type="button"
        aria-label={label}
        className="inline-flex items-center justify-center rounded-full text-gray-400 transition hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <Info className="h-4 w-4" aria-hidden="true" />
      </button>
    </Tooltip>
  );
};
