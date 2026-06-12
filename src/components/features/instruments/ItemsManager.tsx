/**
 * Komponen manajemen item instrumen (CRUD) untuk admin.
 *
 * Menampilkan daftar item dalam tabel, dengan kemampuan menambah item baru
 * (satu per satu atau bulk), mengedit konten item, dan menghapus item.
 * Domain dipilih dari dropdown berdasarkan daftar domain yang sudah ada.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Upload, X, Check } from "lucide-react";
import type { ItemResponse } from "@/types/item";
import type { DomainResponse } from "@/types/domain";
import { TableInfoTooltip } from "@/components/ui/Tooltip";

/**
 * Props untuk ItemsManager.
 */
interface ItemsManagerProps {
  instrumentId: string;
  initialItems: ItemResponse[];
  /** Daftar domain yang tersedia untuk dropdown. */
  domains: DomainResponse[];
}

/**
 * Draft satu item baru sebelum disimpan.
 */
interface ItemDraft {
  content: string;
  /** ID domain yang dipilih dari dropdown. */
  domain_id: string;
}

/**
 * Komponen manajemen item instrumen.
 *
 * Menampilkan tabel item yang dapat diedit inline, dengan dialog untuk
 * menambah item baru (single atau bulk via textarea).
 * Domain dipilih dari dropdown yang berisi daftar domain yang sudah ada.
 *
 * @param props.instrumentId - ID instrumen pemilik item.
 * @param props.initialItems - Daftar item awal dari server.
 * @param props.domains - Daftar domain yang tersedia untuk dropdown.
 * @returns Komponen manajemen item interaktif.
 */
export const ItemsManager = ({ instrumentId, initialItems, domains }: ItemsManagerProps) => {
  const router = useRouter();
  const [items, setItems] = useState<ItemResponse[]>(initialItems);
  const [mode, setMode] = useState<"idle" | "add-single" | "add-bulk">("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editDomain, setEditDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // State untuk tambah satu item
  const [newItem, setNewItem] = useState<ItemDraft>({ content: "", domain_id: "" });

  // State untuk bulk add
  const [bulkText, setBulkText] = useState("");

  /**
   * Memulai mode edit untuk item tertentu.
   *
   * @param item - Item yang akan diedit.
   */
  const startEdit = (item: ItemResponse) => {
    setEditingId(item.id);
    setEditContent(item.content);
    setEditDomain(item.domain_id ?? "");
    setError(null);
  };

  /**
   * Membatalkan mode edit.
   */
  const cancelEdit = () => {
    setEditingId(null);
    setError(null);
  };

  /**
   * Menyimpan perubahan item yang sedang diedit.
   *
   * @param item - Item yang akan diperbarui.
   */
  const saveEdit = async (item: ItemResponse) => {
    if (!editContent.trim()) {
      setError("Konten item tidak boleh kosong.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/instruments/${instrumentId}/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editContent.trim(),
          domain_id: editDomain.trim() || null,
          sequence_number: item.sequence_number,
        }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menyimpan item (${resp.status})`);
      }
      const updated: ItemResponse = await resp.json();
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan item.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Menghapus satu item setelah konfirmasi pengguna.
   *
   * @param item - Item yang akan dihapus.
   */
  const deleteItem = async (item: ItemResponse) => {
    if (!confirm(`Hapus item #${item.sequence_number}? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/instruments/${instrumentId}/items/${item.id}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menghapus item (${resp.status})`);
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus item.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Menambah satu item baru ke instrumen.
   */
  const addSingleItem = async () => {
    if (!newItem.content.trim()) {
      setError("Konten item tidak boleh kosong.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/instruments/${instrumentId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              sequence_number: items.length + 1,
              content: newItem.content.trim(),
              domain_id: newItem.domain_id || undefined,
            },
          ],
        }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menambah item (${resp.status})`);
      }
      const created: ItemResponse[] = await resp.json();
      setItems((prev) => [...prev, ...created]);
      setNewItem({ content: "", domain_id: "" });
      setMode("idle");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah item.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Menambah banyak item sekaligus dari textarea (satu baris = satu item).
   */
  const addBulkItems = async () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setError("Masukkan minimal satu item.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/instruments/${instrumentId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((content, idx) => ({
            sequence_number: items.length + idx + 1,
            content,
          })),
        }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menambah item (${resp.status})`);
      }
      const created: ItemResponse[] = await resp.json();
      setItems((prev) => [...prev, ...created]);
      setBulkText("");
      setMode("idle");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-gray-500">{items.length} item</span>
          <TableInfoTooltip description="Daftar item/pernyataan instrumen yang akan dinilai expert, beserta domain pengelompokannya. Item inilah yang dihitung nilai I-CVI dan S-CVI-nya." />
        </div>
        {mode === "idle" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("add-single");
                setError(null);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Item
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("add-bulk");
                setError(null);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition"
            >
              <Upload className="h-3.5 w-3.5" /> Tambah Massal
            </button>
          </div>
        )}
        {mode !== "idle" && (
          <button
            type="button"
            onClick={() => {
              setMode("idle");
              setError(null);
            }}
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

      {/* Form tambah satu item */}
      {mode === "add-single" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
          <p className="text-xs font-medium text-blue-800">Tambah Item Baru</p>
          <textarea
            value={newItem.content}
            onChange={(e) => setNewItem((p) => ({ ...p, content: e.target.value }))}
            placeholder="Konten item..."
            rows={3}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <div>
            <label
              htmlFor="item-domain-select"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Domain / Dimensi (opsional)
            </label>
            <select
              id="item-domain-select"
              value={newItem.domain_id}
              onChange={(e) => setNewItem((p) => ({ ...p, domain_id: e.target.value }))}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="">-- Tanpa domain --</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {domains.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">
                Belum ada domain. Tambahkan di tab &ldquo;Dimensi&rdquo;.
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addSingleItem}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Item"}
            </button>
          </div>
        </div>
      )}

      {/* Form tambah massal */}
      {mode === "add-bulk" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
          <p className="text-xs font-medium text-blue-800">
            Tambah Banyak Item — satu baris = satu item
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"Item pertama\nItem kedua\nItem ketiga\n..."}
            rows={8}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-600">
              {bulkText.split("\n").filter((l) => l.trim()).length} item akan ditambahkan
            </span>
            <button
              type="button"
              onClick={addBulkItems}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Semua"}
            </button>
          </div>
        </div>
      )}

      {/* Item table */}
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
          <p className="text-sm text-gray-500">Belum ada item. Tambahkan item di atas.</p>
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
                  Konten Item
                </th>
                <th className="w-40 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Domain
                </th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) =>
                editingId === item.id ? (
                  <tr key={item.id} className="bg-yellow-50">
                    <td className="px-4 py-3 text-sm text-gray-500 text-center">
                      {item.sequence_number}
                    </td>
                    <td className="px-4 py-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <select
                          value={editDomain}
                          onChange={(e) => setEditDomain(e.target.value)}
                          className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                          <option value="">-- Tanpa domain --</option>
                          {domains.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => saveEdit(item)}
                          disabled={loading}
                          className="rounded-md p-1.5 text-green-600 hover:bg-green-50 transition disabled:opacity-50"
                          title="Simpan"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 transition"
                          title="Batal"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500 text-center">
                      {item.sequence_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.content}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {item.domain_id
                        ? (domains.find((d) => d.id === item.domain_id)?.name ?? item.domain_id)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItem(item)}
                          disabled={loading}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
