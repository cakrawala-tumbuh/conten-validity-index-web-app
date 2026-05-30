/**
 * Unit test untuk komponen InstrumentTable.
 *
 * Menguji rendering tabel, tampilan data instrumen, dan state kosong.
 */
import { render, screen } from "@testing-library/react";
import { InstrumentTable } from "@/components/features/instruments/InstrumentTable";
import type { InstrumentResponse } from "@/types/instrument";

const mockInstruments: InstrumentResponse[] = [
  {
    id: "inst-1",
    name: "Instrumen Keperawatan A",
    description: "Deskripsi instrumen A",
    version: "1.0",
    status: "active",
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "inst-2",
    name: "Instrumen Kebidanan B",
    description: null,
    version: "1.0",
    status: "draft",
    created_by: "user-1",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
  },
];

// Mock next/navigation untuk Link component
jest.mock("next/navigation", () => ({
  usePathname: () => "/instruments",
}));

describe("InstrumentTable", () => {
  it("harus menampilkan pesan kosong jika tidak ada instrumen", () => {
    render(<InstrumentTable instruments={[]} />);
    expect(screen.getByText(/belum ada instrumen/i)).toBeInTheDocument();
  });

  it("harus merender tabel dengan semua nama instrumen", () => {
    render(<InstrumentTable instruments={mockInstruments} />);
    expect(screen.getByText("Instrumen Keperawatan A")).toBeInTheDocument();
    expect(screen.getByText("Instrumen Kebidanan B")).toBeInTheDocument();
  });

  it("harus menampilkan deskripsi instrumen jika ada", () => {
    render(<InstrumentTable instruments={mockInstruments} />);
    expect(screen.getByText("Deskripsi instrumen A")).toBeInTheDocument();
  });

  it("harus menampilkan link 'Detail' untuk setiap instrumen", () => {
    render(<InstrumentTable instruments={mockInstruments} />);
    const links = screen.getAllByRole("link", { name: /detail/i });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/instruments/inst-1");
    expect(links[1]).toHaveAttribute("href", "/instruments/inst-2");
  });
});
