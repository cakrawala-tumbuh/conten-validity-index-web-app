/**
 * Unit test untuk komponen CVISection.
 *
 * Menguji rendering awal dengan tombol Hitung CVI dan penanganan error.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CVISection } from "@/components/features/instruments/CVISection";

const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock URL methods tidak tersedia di JSDOM
global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = jest.fn();

describe("CVISection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("harus menampilkan tombol Hitung CVI di awal", () => {
    render(<CVISection instrumentId="inst-1" instrumentName="Instrumen A" />);
    expect(screen.getByRole("button", { name: /hitung cvi/i })).toBeInTheDocument();
  });

  it("harus menampilkan deskripsi instruksi sebelum kalkulasi", () => {
    render(<CVISection instrumentId="inst-1" instrumentName="Instrumen A" />);
    expect(screen.getByText(/untuk menampilkan hasil kalkulasi/i)).toBeInTheDocument();
  });

  it("harus menampilkan pesan error jika fetch gagal", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Tidak cukup data penilaian" }),
    });
    render(<CVISection instrumentId="inst-1" instrumentName="Instrumen A" />);
    fireEvent.click(screen.getByRole("button", { name: /hitung cvi/i }));
    await waitFor(() => {
      expect(screen.getByText(/tidak cukup data penilaian/i)).toBeInTheDocument();
    });
  });

  it("harus menampilkan hasil CVI setelah fetch berhasil", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        instrument_id: "inst-1",
        n_experts: 5,
        s_cvi_ave: 0.85,
        s_cvi_ua: 0.80,
        items: [
          { item_id: "item-1", sequence_number: 1, content: "Item satu", i_cvi: 0.8, n_relevant: 4 },
        ],
      }),
    });
    render(<CVISection instrumentId="inst-1" instrumentName="Instrumen A" />);
    fireEvent.click(screen.getByRole("button", { name: /hitung cvi/i }));
    await waitFor(() => {
      expect(screen.getByText("S-CVI/Ave")).toBeInTheDocument();
    });
    expect(screen.getByText("S-CVI/UA")).toBeInTheDocument();
    expect(screen.getByText("Item satu")).toBeInTheDocument();
  });

  it("harus menampilkan tombol Export Excel setelah hasil muncul", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        instrument_id: "inst-1",
        n_experts: 5,
        s_cvi_ave: 0.9,
        s_cvi_ua: 0.85,
        items: [],
      }),
    });
    render(<CVISection instrumentId="inst-1" instrumentName="Instrumen A" />);
    fireEvent.click(screen.getByRole("button", { name: /hitung cvi/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /export excel/i })).toBeInTheDocument();
    });
  });

  it("harus menampilkan tombol Hitung Ulang setelah hasil muncul", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        instrument_id: "inst-1",
        n_experts: 3,
        s_cvi_ave: 0.75,
        s_cvi_ua: 0.70,
        items: [],
      }),
    });
    render(<CVISection instrumentId="inst-1" instrumentName="Instrumen A" />);
    fireEvent.click(screen.getByRole("button", { name: /hitung cvi/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /hitung ulang/i })).toBeInTheDocument();
    });
  });

  it("harus memanggil endpoint export saat tombol Export diklik", async () => {
    // Pertama, hitung CVI
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        instrument_id: "inst-1",
        n_experts: 3,
        s_cvi_ave: 0.75,
        s_cvi_ua: 0.70,
        items: [],
      }),
    });
    // Lalu, export
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(["data"], { type: "application/vnd.ms-excel" }),
      json: async () => ({}),
    });
    render(<CVISection instrumentId="inst-1" instrumentName="Instrumen A" />);
    fireEvent.click(screen.getByRole("button", { name: /hitung cvi/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /export excel/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /export excel/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/instruments/inst-1/cvi/export"),
      );
    });
  });

  it("harus menampilkan error jika export gagal", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        instrument_id: "inst-1",
        n_experts: 3,
        s_cvi_ave: 0.75,
        s_cvi_ua: 0.70,
        items: [],
      }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Gagal ekspor" }),
    });
    render(<CVISection instrumentId="inst-1" instrumentName="Instrumen A" />);
    fireEvent.click(screen.getByRole("button", { name: /hitung cvi/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /export excel/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /export excel/i }));
    await waitFor(() => {
      expect(screen.getByText("Gagal ekspor")).toBeInTheDocument();
    });
  });
});
