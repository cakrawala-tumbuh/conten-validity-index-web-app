/**
 * Komponen manajemen daftar master bidang keahlian (CRUD) untuk admin.
 *
 * Menampilkan daftar bidang keahlian dalam tabel, dengan kemampuan menambah,
 * mengedit, dan menghapus. Menghapus bidang keahlian akan otomatis melepaskan
 * keterkaitannya dengan expert mana pun.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, X, GraduationCap } from "lucide-react";
import type { ExpertiseAreaResponse } from "@/types/expertise-area";
import { TableInfoTooltip } from "@/components/ui/Tooltip";

/**
 * Props untuk ExpertiseAreaManager.
 */
interface ExpertiseAreaManagerProps {
  initialAreas: ExpertiseAreaResponse[];
}

/**
 * State form bidang keahlian untuk operasi tambah/edit.
 */
interface AreaFormState {
  name: string;
  description: string;
}

/** State form kosong sebagai nilai awal. */
const EMPTY_FORM: AreaFormState = { name: "", description: "" };

/**
 * Komponen manajemen master bidang keahlian.
 *
 * @param props.initialAreas - Daftar bidang keahlian awal dari server.
 * @returns Komponen manajemen bidang keahlian interaktif.
 */
export const ExpertiseAreaManager = ({ initialAreas }: ExpertiseAreaManagerProps) => {
  const router = useRouter();
  const [areas, setAreas] = useState<ExpertiseAreaResponse[]>(initialAreas);
  const [mode, setMode] = useState<"idle" | "add" | "edit">("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AreaFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Memperbarui satu field pada state form.
   *
   * @param field - Nama field form yang diperbarui.
   * @param value - Nilai baru untuk field tersebut.
   */
  const updateField = (field: keyof AreaFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /** Membuka panel tambah bidang keahlian baru. */
  const startAdd = () => {
    setMode("add");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  /**
   * Membuka panel edit untuk bidang keahlian tertentu.
   *
   * @param area - Bidang keahlian yang akan diedit.
   */
  const startEdit = (area: ExpertiseAreaResponse) => {
    setMode("edit");
    setEditingId(area.id);
    setForm({ name: area.name, description: area.description ?? "" });
    setError(null);
  };

  /** Menutup panel form dan kembali ke mode idle. */
  const closeForm = () => {
    setMode("idle");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  /**
   * Menyimpan bidang keahlian baru atau perubahan yang sedang diedit.
   */
  const saveForm = async () => {
    if (!form.name.trim()) {
      setError("Nama bidang keahlian tidak boleh kosong.");
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
    };

    try {
      const isEdit = mode === "edit" && editingId !== null;
      const url = isEdit ? `/api/expertise-areas/${editingId}` : "/api/expertise-areas";
      const resp = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menyimpan bidang keahlian (${resp.status})`);
      }
      const saved: ExpertiseAreaResponse = await resp.json();
      setAreas((prev) =>
        isEdit ? prev.map((a) => (a.id === saved.id ? saved : a)) : [...prev, saved],
      );
      closeForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan bidang keahlian.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Menghapus bidang keahlian setelah konfirmasi pengguna.
   *
   * @param area - Bidang keahlian yang akan dihapus.
   */
  const deleteArea = async (area: ExpertiseAreaResponse) => {
    if (
      !confirm(`Hapus bidang keahlian "${area.name}"? Keterkaitan dengan expert akan dilepaskan.`)
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/expertise-areas/${area.id}`, { method: "DELETE" });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menghapus bidang keahlian (${resp.status})`);
      }
      setAreas((prev) => prev.filter((a) => a.id !== area.id));
      if (editingId === area.id) closeForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus bidang keahlian.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{areas.length} bidang keahlian</span>
        {mode === "idle" ? (
          <button
            type="button"
            onClick={startAdd}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Bidang Keahlian
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

      {/* Form tambah / edit */}
      {mode !== "idle" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
          <p className="text-xs font-medium text-blue-800">
            {mode === "edit" ? "Edit Bidang Keahlian" : "Tambah Bidang Keahlian Baru"}
          </p>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">Nama</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveForm();
                if (e.key === "Escape") closeForm();
              }}
              placeholder="Contoh: Psikologi Pendidikan"
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">Deskripsi (opsional)</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Deskripsi singkat bidang keahlian..."
              rows={2}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={saveForm}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      )}

      {/* Tabel bidang keahlian */}
      {areas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            Belum ada bidang keahlian. Tambahkan agar dapat dipilih oleh expert.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-medium text-gray-700">Daftar Bidang Keahlian</h3>
            <TableInfoTooltip description="Daftar master bidang keahlian yang dapat dipilih untuk mengategorikan keahlian setiap expert." />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Deskripsi
                  </th>
                  <th className="w-24 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {areas.map((area) => (
                  <tr
                    key={area.id}
                    className={editingId === area.id ? "bg-yellow-50" : "hover:bg-gray-50"}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 align-top">
                      {area.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 align-top">
                      {area.description ? (
                        <span className="line-clamp-2">{area.description}</span>
                      ) : (
                        <span className="italic text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => startEdit(area)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteArea(area)}
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
        </>
      )}
    </div>
  );
};
