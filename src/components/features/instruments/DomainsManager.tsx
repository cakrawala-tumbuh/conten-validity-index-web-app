/**
 * Komponen manajemen domain/dimensi instrumen (CRUD) untuk admin.
 *
 * Menampilkan daftar domain dalam tabel, dengan kemampuan menambah domain baru,
 * mengedit nama domain, dan menghapus domain. Item yang terkait dengan domain
 * yang dihapus akan kehilangan referensi domain-nya (domain_id menjadi null).
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, X, Check, Layers } from "lucide-react";
import type { DomainResponse } from "@/types/domain";

/**
 * Props untuk DomainsManager.
 */
interface DomainsManagerProps {
  instrumentId: string;
  initialDomains: DomainResponse[];
}

/**
 * Komponen manajemen domain/dimensi instrumen.
 *
 * Menampilkan tabel domain yang dapat diedit inline, dengan dialog untuk
 * menambah domain baru. Setiap domain dapat diedit atau dihapus.
 *
 * @param props.instrumentId - ID instrumen pemilik domain.
 * @param props.initialDomains - Daftar domain awal dari server.
 * @returns Komponen manajemen domain interaktif.
 */
export const DomainsManager = ({ instrumentId, initialDomains }: DomainsManagerProps) => {
  const router = useRouter();
  const [domains, setDomains] = useState<DomainResponse[]>(initialDomains);
  const [mode, setMode] = useState<"idle" | "add">("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Memulai mode edit untuk domain tertentu.
   *
   * @param domain - Domain yang akan diedit.
   */
  const startEdit = (domain: DomainResponse) => {
    setEditingId(domain.id);
    setEditName(domain.name);
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
   * Menyimpan perubahan nama domain yang sedang diedit.
   *
   * @param domain - Domain yang akan diperbarui.
   */
  const saveEdit = async (domain: DomainResponse) => {
    if (!editName.trim()) {
      setError("Nama domain tidak boleh kosong.");
      return;
    }
    if (editName.trim() === domain.name) {
      setEditingId(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/instruments/${instrumentId}/domains/${domain.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menyimpan domain (${resp.status})`);
      }
      const updated: DomainResponse = await resp.json();
      setDomains((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setEditingId(null);
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
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus domain.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Menambah domain baru ke instrumen.
   */
  const addDomain = async () => {
    if (!newName.trim()) {
      setError("Nama domain tidak boleh kosong.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/instruments/${instrumentId}/domains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menambah domain (${resp.status})`);
      }
      const created: DomainResponse = await resp.json();
      setDomains((prev) => [...prev, created]);
      setNewName("");
      setMode("idle");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah domain.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{domains.length} domain</span>
        {mode === "idle" && (
          <button
            type="button"
            onClick={() => {
              setMode("add");
              setError(null);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Domain
          </button>
        )}
        {mode === "add" && (
          <button
            type="button"
            onClick={() => {
              setMode("idle");
              setNewName("");
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

      {/* Form tambah domain */}
      {mode === "add" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
          <p className="text-xs font-medium text-blue-800">Tambah Domain / Dimensi Baru</p>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addDomain();
            }}
            placeholder="Nama domain (contoh: Kognitif, Afektif, Psikomotor)"
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            autoFocus
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addDomain}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Domain"}
            </button>
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
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {domains.map((domain, idx) =>
                editingId === domain.id ? (
                  <tr key={domain.id} className="bg-yellow-50">
                    <td className="px-4 py-3 text-sm text-gray-500 text-center">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(domain);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        autoFocus
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => saveEdit(domain)}
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
                  <tr key={domain.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500 text-center">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{domain.name}</td>
                    <td className="px-4 py-3">
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
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
