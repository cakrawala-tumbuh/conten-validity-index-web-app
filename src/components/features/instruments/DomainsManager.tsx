/**
 * Komponen manajemen domain/dimensi instrumen (CRUD) untuk admin.
 *
 * Menampilkan daftar domain dalam tabel, dengan kemampuan menambah domain baru,
 * mengedit domain, dan menghapus domain. Selain nama, setiap domain dapat
 * menyimpan kisi-kisi konstruk: definisi konstruk (kolom D), contoh indikator
 * perilaku (kolom E), dan referensi teori (kolom F). Item yang terkait dengan
 * domain yang dihapus akan kehilangan referensi domain-nya (domain_id menjadi null).
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, X, Layers } from "lucide-react";
import type { DomainResponse } from "@/types/domain";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { TableInfoTooltip } from "@/components/ui/Tooltip";

/**
 * Props untuk DomainsManager.
 */
interface DomainsManagerProps {
  instrumentId: string;
  initialDomains: DomainResponse[];
}

/**
 * State form domain untuk operasi tambah/edit.
 */
interface DomainFormState {
  name: string;
  construct_definition: string;
  behavioral_indicator_example: string;
  theory_reference: string;
  /** Warna latar dimensi (hex `#RRGGBB`), atau string kosong bila tidak ada. */
  background_color: string;
}

/**
 * State form kosong sebagai nilai awal.
 */
const EMPTY_FORM: DomainFormState = {
  name: "",
  construct_definition: "",
  behavioral_indicator_example: "",
  theory_reference: "",
  background_color: "",
};

/**
 * Mengubah string menjadi nilai trim atau null bila kosong.
 *
 * @param value - Nilai mentah dari input form.
 * @returns String hasil trim, atau null bila string kosong.
 */
const toNullable = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * Komponen manajemen domain/dimensi instrumen.
 *
 * Menampilkan tabel domain dengan dialog untuk menambah maupun mengedit domain
 * beserta kisi-kisi konstruknya (definisi, contoh indikator, dan referensi teori).
 *
 * @param props.instrumentId - ID instrumen pemilik domain.
 * @param props.initialDomains - Daftar domain awal dari server.
 * @returns Komponen manajemen domain interaktif.
 */
export const DomainsManager = ({ instrumentId, initialDomains }: DomainsManagerProps) => {
  const router = useRouter();
  const [domains, setDomains] = useState<DomainResponse[]>(initialDomains);
  const [mode, setMode] = useState<"idle" | "add" | "edit">("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DomainFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Memperbarui satu field pada state form.
   *
   * @param field - Nama field form yang diperbarui.
   * @param value - Nilai baru untuk field tersebut.
   */
  const updateField = (field: keyof DomainFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Membuka panel tambah domain baru.
   */
  const startAdd = () => {
    setMode("add");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  /**
   * Membuka panel edit untuk domain tertentu.
   *
   * @param domain - Domain yang akan diedit.
   */
  const startEdit = (domain: DomainResponse) => {
    setMode("edit");
    setEditingId(domain.id);
    setForm({
      name: domain.name,
      construct_definition: domain.construct_definition ?? "",
      behavioral_indicator_example: domain.behavioral_indicator_example ?? "",
      theory_reference: domain.theory_reference ?? "",
      background_color: domain.background_color ?? "",
    });
    setError(null);
  };

  /**
   * Menutup panel form dan mengembalikan ke mode idle.
   */
  const closeForm = () => {
    setMode("idle");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  /**
   * Menyimpan domain baru atau perubahan domain yang sedang diedit.
   *
   * Memvalidasi nama tidak kosong, lalu mengirim request ke API sesuai mode
   * (POST untuk tambah, PATCH untuk edit).
   */
  const saveForm = async () => {
    if (!form.name.trim()) {
      setError("Nama domain tidak boleh kosong.");
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      construct_definition: toNullable(form.construct_definition),
      behavioral_indicator_example: toNullable(form.behavioral_indicator_example),
      theory_reference: toNullable(form.theory_reference),
      background_color: toNullable(form.background_color),
    };

    try {
      const isEdit = mode === "edit" && editingId !== null;
      const url = isEdit
        ? `/api/instruments/${instrumentId}/domains/${editingId}`
        : `/api/instruments/${instrumentId}/domains`;
      const resp = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menyimpan domain (${resp.status})`);
      }
      const saved: DomainResponse = await resp.json();
      setDomains((prev) =>
        isEdit ? prev.map((d) => (d.id === saved.id ? saved : d)) : [...prev, saved],
      );
      closeForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan domain.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Menghapus domain setelah konfirmasi pengguna.
   *
   * Peringatan: item yang terkait dengan domain ini akan kehilangan referensi.
   *
   * @param domain - Domain yang akan dihapus.
   */
  const deleteDomain = async (domain: DomainResponse) => {
    if (
      !confirm(
        `Hapus domain "${domain.name}"? Item yang menggunakan domain ini akan kehilangan referensi domain.`,
      )
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/instruments/${instrumentId}/domains/${domain.id}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menghapus domain (${resp.status})`);
      }
      setDomains((prev) => prev.filter((d) => d.id !== domain.id));
      if (editingId === domain.id) closeForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus domain.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-gray-500">{domains.length} domain</span>
          <TableInfoTooltip description="Daftar domain/dimensi yang mengelompokkan item instrumen. Tiap domain memiliki nama, warna penanda, dan definisi konstruk yang menjadi acuan penilaian expert." />
        </div>
        {mode === "idle" ? (
          <button
            type="button"
            onClick={startAdd}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Domain
          </button>
        ) : (
          <button
            type="button"
            onClick={closeForm}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <X className="h-3.5 w-3.5" /> Batal
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form tambah / edit domain */}
      {mode !== "idle" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
          <p className="text-xs font-medium text-blue-800">
            {mode === "edit" ? "Edit Domain / Dimensi" : "Tambah Domain / Dimensi Baru"}
          </p>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">Nama Domain</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveForm();
                if (e.key === "Escape") closeForm();
              }}
              placeholder="Nama domain (contoh: Stability of Change)"
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">Definisi Konstruk</label>
            <textarea
              value={form.construct_definition}
              onChange={(e) => updateField("construct_definition", e.target.value)}
              placeholder="Definisi konstruk yang diukur oleh dimensi ini..."
              rows={3}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">
              Contoh Indikator Perilaku
            </label>
            <textarea
              value={form.behavioral_indicator_example}
              onChange={(e) => updateField("behavioral_indicator_example", e.target.value)}
              placeholder="Contoh indikator perilaku yang mencerminkan konstruk..."
              rows={3}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">Referensi Teori</label>
            <textarea
              value={form.theory_reference}
              onChange={(e) => updateField("theory_reference", e.target.value)}
              placeholder="Referensi teori pendukung (contoh: Rafferty & Griffin, 2006)..."
              rows={2}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">Warna Latar Dimensi</label>
            <p className="text-xs text-gray-500">
              Warna ini dipakai sebagai latar item milik dimensi ini pada tabel penilaian expert,
              agar mudah dibedakan.
            </p>
            <ColorPicker
              value={form.background_color || null}
              onChange={(value) => setForm((prev) => ({ ...prev, background_color: value ?? "" }))}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={saveForm}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Domain"}
            </button>
          </div>
        </div>
      )}

      {/* Legenda warna dimensi */}
      {domains.some((d) => d.background_color) && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            Keterangan Warna Dimensi
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {domains
              .filter((d) => d.background_color)
              .map((d) => (
                <div key={d.id} className="flex items-center gap-2">
                  <span
                    className="inline-block h-4 w-4 rounded border border-black/10"
                    style={{ backgroundColor: d.background_color ?? undefined }}
                  />
                  <span className="text-xs text-gray-700">{d.name}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Domain table */}
      {domains.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
          <Layers className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            Belum ada domain. Tambahkan domain untuk mengelompokkan item.
          </p>
          <p className="text-xs text-gray-400">
            Contoh domain: Kognitif, Afektif, Psikomotor, atau dimensi lainnya.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nama Domain
                </th>
                <th className="w-20 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Warna
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Definisi Konstruk
                </th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {domains.map((domain, idx) => (
                <tr
                  key={domain.id}
                  className={editingId === domain.id ? "bg-yellow-50" : "hover:bg-gray-50"}
                >
                  <td className="px-4 py-3 text-sm text-gray-500 text-center align-top">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 align-top">
                    {domain.name}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {domain.background_color ? (
                      <span className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-4 w-4 rounded border border-black/10"
                          style={{ backgroundColor: domain.background_color }}
                        />
                        <span className="font-mono text-xs text-gray-500">
                          {domain.background_color}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs italic text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 align-top">
                    {domain.construct_definition ? (
                      <span className="line-clamp-2">{domain.construct_definition}</span>
                    ) : (
                      <span className="italic text-gray-300">Belum diisi</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => startEdit(domain)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDomain(domain)}
                        disabled={loading}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
