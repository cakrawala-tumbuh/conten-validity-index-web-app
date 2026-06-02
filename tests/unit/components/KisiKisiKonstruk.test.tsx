/**
 * Unit test untuk komponen KisiKisiKonstruk.
 *
 * Menguji rendering tabel kisi-kisi konstruk, penyaringan domain tanpa
 * kisi-kisi, serta tampilan placeholder untuk kolom yang kosong.
 */
import { render, screen } from "@testing-library/react";
import { KisiKisiKonstruk } from "@/components/features/ratings/KisiKisiKonstruk";
import type { DomainResponse } from "@/types/domain";

/**
 * Membuat objek domain untuk keperluan test.
 *
 * @param overrides - Field yang ingin ditimpa pada domain default.
 * @returns Objek DomainResponse lengkap.
 */
const makeDomain = (overrides: Partial<DomainResponse>): DomainResponse => ({
  id: "dom-1",
  instrument_id: "inst-1",
  name: "Dimensi",
  construct_definition: null,
  behavioral_indicator_example: null,
  theory_reference: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

describe("KisiKisiKonstruk", () => {
  it("harus tidak merender apa pun jika tidak ada domain", () => {
    const { container } = render(<KisiKisiKonstruk domains={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("harus tidak merender apa pun jika tidak ada domain dengan kisi-kisi", () => {
    const { container } = render(
      <KisiKisiKonstruk domains={[makeDomain({ id: "dom-1", name: "Kosong" })]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("harus merender tabel kisi-kisi untuk domain yang memiliki definisi konstruk", () => {
    render(
      <KisiKisiKonstruk
        domains={[
          makeDomain({
            id: "dom-1",
            name: "Stability of Change",
            construct_definition: "Sejauh mana kebijakan tetap stabil.",
            behavioral_indicator_example: "Frekuensi perubahan kebijakan.",
            theory_reference: "Rafferty & Griffin (2006)",
          }),
        ]}
      />,
    );
    expect(screen.getByText("Kisi-Kisi Konstruk")).toBeInTheDocument();
    expect(screen.getByText("Stability of Change")).toBeInTheDocument();
    expect(screen.getByText("Sejauh mana kebijakan tetap stabil.")).toBeInTheDocument();
    expect(screen.getByText("Frekuensi perubahan kebijakan.")).toBeInTheDocument();
    expect(screen.getByText("Rafferty & Griffin (2006)")).toBeInTheDocument();
  });

  it("harus menyaring domain tanpa kisi-kisi dari tabel", () => {
    render(
      <KisiKisiKonstruk
        domains={[
          makeDomain({ id: "dom-1", name: "Terisi", construct_definition: "Ada definisi." }),
          makeDomain({ id: "dom-2", name: "Kosong" }),
        ]}
      />,
    );
    expect(screen.getByText("Terisi")).toBeInTheDocument();
    expect(screen.queryByText("Kosong")).not.toBeInTheDocument();
  });

  it("harus menampilkan placeholder untuk kolom yang kosong pada domain yang terisi sebagian", () => {
    render(
      <KisiKisiKonstruk
        domains={[
          makeDomain({
            id: "dom-1",
            name: "Sebagian",
            theory_reference: "Hanya referensi teori.",
          }),
        ]}
      />,
    );
    expect(screen.getByText("Hanya referensi teori.")).toBeInTheDocument();
    // Definisi konstruk dan contoh indikator kosong → ditampilkan sebagai "—"
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(2);
  });
});
