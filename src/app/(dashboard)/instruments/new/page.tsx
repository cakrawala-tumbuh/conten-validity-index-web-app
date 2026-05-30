/**
 * Halaman form pembuatan instrumen baru.
 *
 * Menampilkan form dengan field nama, deskripsi, versi instrumen,
 * dan daftar item yang dapat ditambah secara inline.
 * Setelah berhasil dibuat beserta item-itemnya, pengguna diarahkan
 * kembali ke daftar instrumen.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Representasi satu item yang diisi di form sebelum disimpan.
 */
interface ItemDraft {
  content: string;
}

/**
 * Halaman buat instrumen baru — Client Component.
 *
 * @returns Halaman form pembuatan instrumen dengan input item inline.
 */
export default function NewInstrumentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("1.0");
  const [items, setItems] = useState<ItemDraft[]>([{ content: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Menambahkan baris item baru ke daftar item draft.
   */
  const addItem = () => setItems((prev) => [...prev, { content: "" }]);

  /**
   * Menghapus item pada indeks tertentu dari daftar item draft.
   *
   * @param index - Indeks item yang akan dihapus.
   */
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  /**
   * Memperbarui field `content` atau `domain` pada item di indeks tertentu.
   *
   * @param index - Indeks item yang diperbarui.
   * @param field - Field yang diperbarui (`content` atau `domain`).
   * @param value - Nilai baru.
   */
  const updateItem = (index: number, field: keyof ItemDraft, value: string) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  /**
   * Menangani pengiriman form pembuatan instrumen beserta item-itemnya.
   *
   * Membuat instrumen terlebih dahulu, kemudian melakukan bulk create
   * item yang sudah diisi. Jika tidak ada item yang diisi kontennya,
   * langkah bulk create dilewati.
   *
   * @param e - Event form submission.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const resp = await fetch("/api/instruments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          version,
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal membuat instrumen (${resp.status})`);
      }

      const instrument = await resp.json();

      // Bulk create item jika ada yang diisi
      const validItems = items
        .filter((it) => it.content.trim() !== "")
        .map((it, idx) => ({
          sequence_number: idx + 1,
          content: it.content.trim(),
          dimension_id: undefined,
        }));

      if (validItems.length > 0) {
        const itemsResp = await fetch(`/api/instruments/${instrument.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: validItems }),
        });

        if (!itemsResp.ok) {
          const data = await itemsResp.json().catch(() => ({}));
          throw new Error(
            data.detail ?? `Instrumen dibuat, tetapi gagal menambahkan item (${itemsResp.status})`,
          );
        }
      }

      router.push("/instruments");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/instruments" className="text-sm text-gray-500 hover:text-gray-700">
          ← Kembali
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Buat Instrumen Baru</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Instrumen <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: WCP Survey — Workplace Characteristics Profile"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat tentang instrumen ini (opsional)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
              Versi
            </label>
            <input
              id="version"
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0"
              className="w-40 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Bagian item instrumen */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Item Instrumen</label>
              <button
                type="button"
                onClick={addItem}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                + Tambah Item
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-start rounded-md border border-gray-200 p-3"
                >
                  <span className="mt-2 text-xs font-medium text-gray-400 w-5 shrink-0">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.content}
                      onChange={(e) => updateItem(index, "content", e.target.value)}
                      placeholder="Konten / pernyataan item"
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="mt-1.5 text-xs text-red-400 hover:text-red-600"
                      aria-label={`Hapus item ${index + 1}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Menyimpan..." : "Buat Instrumen"}
            </button>
            <Link
              href="/instruments"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
