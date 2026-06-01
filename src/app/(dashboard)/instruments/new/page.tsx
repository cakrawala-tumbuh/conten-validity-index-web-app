/**
 * Halaman form pembuatan instrumen baru.
 *
 * Menampilkan form dengan field nama, deskripsi, versi instrumen,
 * daftar dimensi/domain, dan daftar item yang dapat ditambah secara inline.
 * Dimensi didefinisikan terlebih dahulu, kemudian item mereferensikan
 * dimensi melalui dropdown. Setelah berhasil dibuat, pengguna diarahkan
 * kembali ke daftar instrumen.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DomainResponse } from "@/types/domain";

/**
 * Representasi satu domain/dimensi yang diisi di form sebelum disimpan.
 */
interface DomainDraft {
  name: string;
}

/**
 * Representasi satu item yang diisi di form sebelum disimpan.
 * `domainIndex` adalah indeks ke array `domains` (-1 = tanpa domain).
 */
interface ItemDraft {
  content: string;
  domainIndex: number;
}

/**
 * Halaman buat instrumen baru — Client Component.
 *
 * Alur submit:
 * 1. Buat instrumen (nama, deskripsi, versi).
 * 2. Buat tiap domain → kumpulkan `DomainResponse[]` dengan ID asli.
 * 3. Buat item dengan `domain_id` yang dipetakan dari hasil langkah 2.
 *
 * @returns Halaman form pembuatan instrumen lengkap.
 */
export default function NewInstrumentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("1.0");
  const [domains, setDomains] = useState<DomainDraft[]>([]);
  const [items, setItems] = useState<ItemDraft[]>([{ content: "", domainIndex: -1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Domain helpers ────────────────────────────────────────────────────────

  /**
   * Menambahkan baris domain baru ke daftar domain draft.
   */
  const addDomain = () => setDomains((prev) => [...prev, { name: "" }]);

  /**
   * Menghapus domain pada indeks tertentu dan reset item yang mereferensikannya.
   *
   * @param index - Indeks domain yang akan dihapus.
   */
  const removeDomain = (index: number) => {
    setDomains((prev) => prev.filter((_, i) => i !== index));
    // Reset domainIndex item yang merujuk domain ini atau yang lebih besar
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        domainIndex:
          it.domainIndex === index
            ? -1
            : it.domainIndex > index
              ? it.domainIndex - 1
              : it.domainIndex,
      })),
    );
  };

  /**
   * Memperbarui nama domain pada indeks tertentu.
   *
   * @param index - Indeks domain yang diperbarui.
   * @param value - Nama baru.
   */
  const updateDomainName = (index: number, value: string) =>
    setDomains((prev) => prev.map((d, i) => (i === index ? { name: value } : d)));

  // ─── Item helpers ──────────────────────────────────────────────────────────

  /**
   * Menambahkan baris item baru ke daftar item draft.
   */
  const addItem = () => setItems((prev) => [...prev, { content: "", domainIndex: -1 }]);

  /**
   * Menghapus item pada indeks tertentu dari daftar item draft.
   *
   * @param index - Indeks item yang akan dihapus.
   */
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  /**
   * Memperbarui field pada item di indeks tertentu.
   *
   * @param index - Indeks item yang diperbarui.
   * @param field - Field yang diperbarui.
   * @param value - Nilai baru.
   */
  const updateItem = (index: number, field: keyof ItemDraft, value: string | number) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  // ─── Submit ────────────────────────────────────────────────────────────────

  /**
   * Menangani pengiriman form pembuatan instrumen beserta domain dan item-nya.
   *
   * @param e - Event form submission.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Buat instrumen
      const instrResp = await fetch("/api/instruments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          version,
        }),
      });

      if (!instrResp.ok) {
        const data = await instrResp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal membuat instrumen (${instrResp.status})`);
      }

      const instrument = await instrResp.json();

      // 2. Buat domain satu per satu, kumpulkan ID hasil API
      const validDomains = domains.filter((d) => d.name.trim() !== "");
      const createdDomains: DomainResponse[] = [];

      for (const domain of validDomains) {
        const domResp = await fetch(`/api/instruments/${instrument.id}/domains`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: domain.name.trim() }),
        });
        if (!domResp.ok) {
          const data = await domResp.json().catch(() => ({}));
          throw new Error(
            data.detail ??
              `Instrumen dibuat, tetapi gagal menambahkan domain "${domain.name}" (${domResp.status})`,
          );
        }
        createdDomains.push(await domResp.json());
      }

      // 3. Bulk create item dengan domain_id yang dipetakan dari hasil langkah 2
      const validItems = items
        .filter((it) => it.content.trim() !== "")
        .map((it, idx) => {
          const domainId =
            it.domainIndex >= 0 && it.domainIndex < createdDomains.length
              ? createdDomains[it.domainIndex].id
              : undefined;
          return {
            sequence_number: idx + 1,
            content: it.content.trim(),
            domain_id: domainId,
          };
        });

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

  // ─── Render ────────────────────────────────────────────────────────────────

  /** Domain yang sudah diberi nama (dipakai sebagai opsi dropdown item). */
  const namedDomains = domains.filter((d) => d.name.trim() !== "");

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

          {/* Nama instrumen */}
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

          {/* Deskripsi */}
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

          {/* Versi */}
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

          {/* ── Dimensi / Domain ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Dimensi / Domain{" "}
                <span className="text-xs font-normal text-gray-400">(opsional)</span>
              </label>
              <button
                type="button"
                onClick={addDomain}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                + Tambah Dimensi
              </button>
            </div>

            {domains.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">
                Belum ada dimensi. Klik &ldquo;+ Tambah Dimensi&rdquo; untuk mengelompokkan item.
              </p>
            ) : (
              <div className="space-y-2">
                {domains.map((domain, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <span className="text-xs font-medium text-gray-400 w-5 shrink-0 text-right">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={domain.name}
                      onChange={(e) => updateDomainName(index, e.target.value)}
                      placeholder="Nama dimensi (contoh: Kognitif, Afektif)"
                      className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeDomain(index)}
                      className="text-xs text-red-400 hover:text-red-600"
                      aria-label={`Hapus dimensi ${index + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Item Instrumen ── */}
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
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={item.content}
                      onChange={(e) => updateItem(index, "content", e.target.value)}
                      placeholder="Konten / pernyataan item"
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <select
                      value={item.domainIndex}
                      onChange={(e) =>
                        updateItem(index, "domainIndex", parseInt(e.target.value, 10))
                      }
                      disabled={namedDomains.length === 0}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value={-1}>
                        {namedDomains.length === 0
                          ? "Tambahkan dimensi di atas untuk memilih"
                          : "— Tanpa dimensi —"}
                      </option>
                      {domains.map((domain, dIdx) =>
                        domain.name.trim() !== "" ? (
                          <option key={dIdx} value={dIdx}>
                            {domain.name.trim()}
                          </option>
                        ) : null,
                      )}
                    </select>
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
