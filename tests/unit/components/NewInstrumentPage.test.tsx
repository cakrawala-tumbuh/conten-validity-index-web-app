/**
 * Unit test untuk halaman NewInstrumentPage.
 *
 * Menguji alur submit pembuatan instrumen baru yang mencakup tiga langkah:
 * 1. POST /api/instruments — buat instrumen
 * 2. POST /api/instruments/{id}/domains — buat tiap domain (jika ada)
 * 3. POST /api/instruments/{id}/items — bulk create item (jika ada)
 *
 * Test juga mencakup tampilan error ketika salah satu langkah gagal.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NewInstrumentPage from "@/app/(dashboard)/instruments/new/page";

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Membuat mock Response-like object yang meniru fetch response.
 *
 * @param body - Objek yang akan di-serialize sebagai JSON response.
 * @param ok - Apakah response dianggap sukses (status 2xx).
 * @param status - HTTP status code.
 * @returns Objek mock response.
 */
function makeFetchResponse(body: object, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
  };
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe("NewInstrumentPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("harus merender form dengan field yang diperlukan", () => {
    render(<NewInstrumentPage />);

    expect(screen.getByLabelText(/nama instrumen/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/deskripsi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/versi/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /buat instrumen/i })).toBeInTheDocument();
    // "Batal" adalah Link (<a>), bukan <button>
    expect(screen.getByRole("link", { name: /batal/i })).toBeInTheDocument();
  });

  it("harus berhasil membuat instrumen tanpa domain dan item", async () => {
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ id: "instr-1", name: "Instrumen #1" }));

    render(<NewInstrumentPage />);

    fireEvent.change(screen.getByLabelText(/nama instrumen/i), {
      target: { value: "Instrumen #1" },
    });

    // Item default dibiarkan kosong — validItems memfilter konten kosong, tidak di-submit
    fireEvent.click(screen.getByRole("button", { name: /buat instrumen/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/instruments",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("Instrumen #1"),
        }),
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/instruments");
    });

    // Hanya satu fetch: instrumen (item kosong tidak di-submit)
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("harus berhasil membuat instrumen dengan domain dan item (skenario screenshot)", async () => {
    // Langkah 1: instrumen dibuat
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ id: "instr-1", name: "Instrumen #1" }, true, 201),
    );
    // Langkah 2: domain "Dimensi #1" dibuat
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ id: "dom-1", name: "Dimensi #1" }, true, 201),
    );
    // Langkah 3: bulk create items
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse([{ id: "item-1" }, { id: "item-2" }], true, 201),
    );

    render(<NewInstrumentPage />);

    // Isi nama instrumen
    fireEvent.change(screen.getByLabelText(/nama instrumen/i), {
      target: { value: "Instrumen #1" },
    });

    // Tambah dimensi — placeholder: "Nama dimensi (contoh: Kognitif, Afektif)"
    fireEvent.click(screen.getByRole("button", { name: /tambah dimensi/i }));
    const domainInputs = screen.getAllByPlaceholderText(/nama dimensi/i);
    fireEvent.change(domainInputs[0], { target: { value: "Dimensi #1" } });

    // Isi item pertama (placeholder: "Konten / pernyataan item")
    const itemInputs = screen.getAllByPlaceholderText(/pernyataan item/i);
    fireEvent.change(itemInputs[0], { target: { value: "Item 1" } });

    // Tambah item kedua
    fireEvent.click(screen.getByRole("button", { name: /tambah item/i }));
    const updatedItemInputs = screen.getAllByPlaceholderText(/pernyataan item/i);
    fireEvent.change(updatedItemInputs[1], { target: { value: "Item #1.1" } });

    fireEvent.click(screen.getByRole("button", { name: /buat instrumen/i }));

    // Verifikasi step 1: POST ke /api/instruments
    await waitFor(() => {
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        "/api/instruments",
        expect.objectContaining({ method: "POST" }),
      );
    });

    // Verifikasi step 2: POST ke /api/instruments/{id}/domains
    await waitFor(() => {
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "/api/instruments/instr-1/domains",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("Dimensi #1"),
        }),
      );
    });

    // Verifikasi step 3: POST ke /api/instruments/{id}/items
    await waitFor(() => {
      expect(mockFetch).toHaveBeenNthCalledWith(
        3,
        "/api/instruments/instr-1/items",
        expect.objectContaining({ method: "POST" }),
      );
    });

    // Verifikasi redirect setelah berhasil
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/instruments");
    });
  });

  it("harus menampilkan error jika pembuatan instrumen gagal (step 1)", async () => {
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ detail: "Terjadi kesalahan internal server." }, false, 500),
    );

    render(<NewInstrumentPage />);
    fireEvent.change(screen.getByLabelText(/nama instrumen/i), {
      target: { value: "Instrumen Gagal" },
    });

    // Item dibiarkan kosong agar tidak ada step 3
    fireEvent.click(screen.getByRole("button", { name: /buat instrumen/i }));

    await waitFor(() => {
      expect(screen.getByText("Terjadi kesalahan internal server.")).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("harus menampilkan error jika pembuatan domain gagal (step 2)", async () => {
    // Instrumen berhasil dibuat
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ id: "instr-1", name: "Instrumen #1" }, true, 201),
    );
    // Domain gagal — tidak ada detail, komponen menggunakan pesan fallback
    mockFetch.mockResolvedValueOnce(makeFetchResponse({}, false, 500));

    render(<NewInstrumentPage />);

    fireEvent.change(screen.getByLabelText(/nama instrumen/i), {
      target: { value: "Instrumen #1" },
    });

    fireEvent.click(screen.getByRole("button", { name: /tambah dimensi/i }));
    const domainInputs = screen.getAllByPlaceholderText(/nama dimensi/i);
    fireEvent.change(domainInputs[0], { target: { value: "Dimensi #1" } });

    // Item dibiarkan kosong
    fireEvent.click(screen.getByRole("button", { name: /buat instrumen/i }));

    await waitFor(() => {
      expect(screen.getByText(/gagal menambahkan domain/i)).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("harus menampilkan error jika pembuatan item gagal (step 3)", async () => {
    // Instrumen berhasil
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ id: "instr-1", name: "Instrumen #1" }, true, 201),
    );
    // Items gagal — tidak ada detail, komponen menggunakan pesan fallback
    mockFetch.mockResolvedValueOnce(makeFetchResponse({}, false, 422));

    render(<NewInstrumentPage />);

    fireEvent.change(screen.getByLabelText(/nama instrumen/i), {
      target: { value: "Instrumen #1" },
    });

    // Isi item default (placeholder: "Konten / pernyataan item")
    const itemInputs = screen.getAllByPlaceholderText(/pernyataan item/i);
    fireEvent.change(itemInputs[0], { target: { value: "Item 1" } });

    fireEvent.click(screen.getByRole("button", { name: /buat instrumen/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/instrumen dibuat, tetapi gagal menambahkan item/i),
      ).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("harus skip step 2 jika tidak ada domain yang diisi", async () => {
    // Instrumen berhasil
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ id: "instr-1", name: "Instrumen #1" }, true, 201),
    );
    // Items berhasil
    mockFetch.mockResolvedValueOnce(makeFetchResponse([{ id: "item-1" }], true, 201));

    render(<NewInstrumentPage />);

    fireEvent.change(screen.getByLabelText(/nama instrumen/i), {
      target: { value: "Instrumen #1" },
    });

    const itemInputs = screen.getAllByPlaceholderText(/pernyataan item/i);
    fireEvent.change(itemInputs[0], { target: { value: "Item 1" } });

    fireEvent.click(screen.getByRole("button", { name: /buat instrumen/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/instruments");
    });

    // Hanya dua fetch: instrumen + items (tanpa domains)
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/domains"),
      expect.anything(),
    );
  });

  it("harus skip step 3 jika tidak ada item yang diisi", async () => {
    // Instrumen berhasil
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ id: "instr-1", name: "Instrumen #1" }, true, 201),
    );
    // Domain berhasil
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ id: "dom-1", name: "Dimensi #1" }, true, 201),
    );

    render(<NewInstrumentPage />);

    fireEvent.change(screen.getByLabelText(/nama instrumen/i), {
      target: { value: "Instrumen #1" },
    });

    fireEvent.click(screen.getByRole("button", { name: /tambah dimensi/i }));
    const domainInputs = screen.getAllByPlaceholderText(/nama dimensi/i);
    fireEvent.change(domainInputs[0], { target: { value: "Dimensi #1" } });

    // Item dibiarkan kosong — tidak akan di-submit
    fireEvent.click(screen.getByRole("button", { name: /buat instrumen/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/instruments");
    });

    // Hanya dua fetch: instrumen + domain (tanpa items)
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/items"),
      expect.anything(),
    );
  });
});
