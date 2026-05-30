/**
 * Komponen tab-based detail instrumen untuk admin.
 *
 * Menggabungkan empat tab: Informasi (edit instrumen + delete), Item (CRUD item),
 * Expert (manajemen assignment), dan Hasil CVI (kalkulasi + export).
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, List, Users, BarChart3 } from "lucide-react";
import { ItemsManager } from "@/components/features/instruments/ItemsManager";
import { AssignmentManager } from "@/components/features/instruments/AssignmentManager";
import { CVISection } from "@/components/features/instruments/CVISection";
import { INSTRUMENT_STATUS_LABELS } from "@/constants";
import type { InstrumentResponse, InstrumentUpdate } from "@/types/instrument";
import type { ItemResponse } from "@/types/item";
import type { AssignmentResponse } from "@/types/expert-assignment";
import type { UserResponse } from "@/types/user";

/**
 * Tab yang tersedia pada halaman detail instrumen.
 */
type Tab = "info" | "items" | "experts" | "cvi";

/**
 * Props untuk InstrumentDetailTabs.
 */
interface InstrumentDetailTabsProps {
  instrument: InstrumentResponse;
  items: ItemResponse[];
  assignments: AssignmentResponse[];
  experts: UserResponse[];
}

/**
 * Komponen utama tabbed layout halaman detail instrumen.
 *
 * Mengelola state tab aktif dan meneruskan data ke komponen child yang sesuai.
 *
 * @param props.instrument - Data instrumen dari server.
 * @param props.items - Daftar item instrumen dari server.
 * @param props.assignments - Daftar assignment expert dari server.
 * @param props.experts - Daftar semua user expert aktif.
 * @returns Layout tabs lengkap halaman detail instrumen.
 */
export const InstrumentDetailTabs = ({
  instrument,
  items,
  assignments,
  experts,
}: InstrumentDetailTabsProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("info");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "info", label: "Informasi", icon: <Info className="h-4 w-4" /> },
    { id: "items", label: `Item (${items.length})`, icon: <List className="h-4 w-4" /> },
    { id: "experts", label: `Expert (${assignments.length})`, icon: <Users className="h-4 w-4" /> },
    { id: "cvi", label: "Hasil CVI", icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-0">
      {/* Tab navigation */}
      <div className="border-b border-gray-200 bg-white rounded-t-lg overflow-x-auto">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="rounded-b-lg bg-white border border-t-0 border-gray-200 p-6">
        {activeTab === "info" && <InfoTab instrument={instrument} />}
        {activeTab === "items" && (
          <ItemsManager instrumentId={instrument.id} initialItems={items} />
        )}
        {activeTab === "experts" && (
          <AssignmentManager
            instrumentId={instrument.id}
            initialAssignments={assignments}
            availableExperts={experts}
          />
        )}
        {activeTab === "cvi" && (
          <CVISection instrumentId={instrument.id} instrumentName={instrument.name} />
        )}
      </div>
    </div>
  );
};

/**
 * Props untuk InfoTab.
 */
interface InfoTabProps {
  instrument: InstrumentResponse;
}

/**
 * Tab Informasi: form edit instrumen dan tombol delete.
 *
 * Menampilkan form untuk memperbarui nama, deskripsi, versi, dan status instrumen.
 * Tombol delete dengan konfirmasi akan menghapus instrumen dan redirect ke /instruments.
 *
 * @param props.instrument - Data instrumen yang akan diedit.
 * @returns Form edit instrumen.
 */
const InfoTab = ({ instrument }: InfoTabProps) => {
  const router = useRouter();
  const [name, setName] = useState(instrument.name);
  const [description, setDescription] = useState(instrument.description ?? "");
  const [version, setVersion] = useState(instrument.version);
  const [status, setStatus] = useState<InstrumentUpdate["status"]>(instrument.status);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  /**
   * Menyimpan perubahan instrumen ke API.
   */
  const handleSave = async () => {
    if (!name.trim()) {
      setError("Nama instrumen tidak boleh kosong.");
      return;
    }
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const resp = await fetch(`/api/instruments/${instrument.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          version: version.trim(),
          status,
        }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menyimpan instrumen (${resp.status})`);
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan instrumen.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Menghapus instrumen setelah konfirmasi dua kali.
   */
  const handleDelete = async () => {
    if (
      !confirm(
        `Hapus instrumen "${instrument.name}"? Semua item dan assignment akan ikut terhapus.`,
      )
    ) {
      return;
    }
    if (!confirm("Konfirmasi sekali lagi: hapus permanen?")) return;

    setDeleting(true);
    setError(null);
    try {
      const resp = await fetch(`/api/instruments/${instrument.id}`, { method: "DELETE" });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menghapus instrumen (${resp.status})`);
      }
      router.push("/instruments");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus instrumen.");
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
          Perubahan berhasil disimpan.
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Instrumen <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Versi</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InstrumentUpdate["status"])}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {Object.entries(INSTRUMENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting || loading}
          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50"
        >
          {deleting ? "Menghapus..." : "Hapus Instrumen"}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || deleting}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
};
