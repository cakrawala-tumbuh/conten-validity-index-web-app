/**
 * Tabel daftar instrumen untuk admin.
 *
 * Menampilkan instrumen dalam format tabel dengan kolom nama, deskripsi,
 * status, jumlah item, jumlah expert, dan aksi.
 */
"use client";

import Link from "next/link";
import { INSTRUMENT_STATUS_LABELS } from "@/constants";
import type { InstrumentResponse } from "@/types/instrument";

/**
 * Props untuk InstrumentTable.
 */
interface InstrumentTableProps {
  instruments: InstrumentResponse[];
}

/**
 * Menampilkan daftar instrumen dalam tabel yang dapat diklik.
 *
 * Setiap baris menampilkan nama instrumen, status (dengan badge warna),
 * jumlah item, dan link ke halaman detail.
 *
 * @param props.instruments - Array data instrumen yang akan ditampilkan.
 * @returns Tabel instrumen atau pesan kosong jika tidak ada data.
 */
export const InstrumentTable = ({ instruments }: InstrumentTableProps) => {
  if (instruments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Belum ada instrumen. Buat instrumen pertama Anda.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Nama
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {instruments.map((instrument) => (
            <tr key={instrument.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-gray-900">{instrument.name}</p>
                {instrument.description && (
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                    {instrument.description}
                  </p>
                )}
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">
                  {INSTRUMENT_STATUS_LABELS[instrument.status]}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                <Link
                  href={`/instruments/${instrument.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Detail
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
