/**
 * Unit test untuk komponen DomainsManager.
 *
 * Menguji rendering daftar domain, state kosong, mode tambah, edit, hapus,
 * serta penyimpanan kisi-kisi konstruk (kolom D/E/F) pada domain.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DomainsManager } from "@/components/features/instruments/DomainsManager";
import type { DomainResponse } from "@/types/domain";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockConfirm = jest.fn();
global.confirm = mockConfirm;

const mockDomains: DomainResponse[] = [
  {
    id: "dom-1",
    instrument_id: "inst-1",
    name: "Kognitif",
    construct_definition: "Definisi konstruk kognitif.",
    behavioral_indicator_example: "Contoh indikator kognitif.",
    theory_reference: "Bloom (1956)",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dom-2",
    instrument_id: "inst-1",
    name: "Afektif",
    construct_definition: null,
    behavioral_indicator_example: null,
    theory_reference: null,
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "dom-3",
    instrument_id: "inst-1",
    name: "Psikomotor",
    construct_definition: null,
    behavioral_indicator_example: null,
    theory_reference: null,
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-03-01T00:00:00Z",
  },
];

describe("DomainsManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("harus menampilkan pesan kosong jika tidak ada domain", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={[]} />);
    expect(screen.getByText(/belum ada domain/i)).toBeInTheDocument();
  });

  it("harus menampilkan jumlah domain", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    expect(screen.getByText(`${mockDomains.length} domain`)).toBeInTheDocument();
  });

  it("harus merender semua domain dalam tabel", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    expect(screen.getByText("Kognitif")).toBeInTheDocument();
    expect(screen.getByText("Afektif")).toBeInTheDocument();
    expect(screen.getByText("Psikomotor")).toBeInTheDocument();
  });

  it("harus menampilkan ringkasan definisi konstruk di tabel", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    expect(screen.getByText("Definisi konstruk kognitif.")).toBeInTheDocument();
  });

  it("harus menampilkan tombol Tambah Domain", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={[]} />);
    expect(screen.getByRole("button", { name: /tambah domain/i })).toBeInTheDocument();
  });

  it("harus menampilkan form tambah domain beserta field kisi-kisi", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah domain/i }));
    expect(screen.getByPlaceholderText(/nama domain/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/definisi konstruk/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contoh indikator perilaku/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/referensi teori/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /simpan domain/i })).toBeInTheDocument();
  });

  it("harus dapat membatalkan form tambah domain", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah domain/i }));
    fireEvent.click(screen.getByRole("button", { name: /batal/i }));
    expect(screen.queryByPlaceholderText(/nama domain/i)).not.toBeInTheDocument();
  });

  it("harus menampilkan error jika nama domain kosong saat submit", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah domain/i }));
    fireEvent.click(screen.getByRole("button", { name: /simpan domain/i }));
    expect(screen.getByText(/nama domain tidak boleh kosong/i)).toBeInTheDocument();
  });

  it("harus berhasil menambahkan domain baru beserta kisi-kisi konstruk", async () => {
    const newDomain: DomainResponse = {
      id: "dom-4",
      instrument_id: "inst-1",
      name: "Sosial",
      construct_definition: "Definisi sosial.",
      behavioral_indicator_example: "Indikator sosial.",
      theory_reference: "Bandura (1977)",
      created_at: "2024-04-01T00:00:00Z",
      updated_at: "2024-04-01T00:00:00Z",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newDomain,
    });
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah domain/i }));
    fireEvent.change(screen.getByPlaceholderText(/nama domain/i), { target: { value: "Sosial" } });
    fireEvent.change(screen.getByPlaceholderText(/definisi konstruk/i), {
      target: { value: "Definisi sosial." },
    });
    fireEvent.change(screen.getByPlaceholderText(/contoh indikator perilaku/i), {
      target: { value: "Indikator sosial." },
    });
    fireEvent.change(screen.getByPlaceholderText(/referensi teori/i), {
      target: { value: "Bandura (1977)" },
    });
    fireEvent.click(screen.getByRole("button", { name: /simpan domain/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/instruments/inst-1/domains",
        expect.objectContaining({ method: "POST" }),
      );
    });
    // Payload harus menyertakan semua field kisi-kisi
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({
      name: "Sosial",
      construct_definition: "Definisi sosial.",
      behavioral_indicator_example: "Indikator sosial.",
      theory_reference: "Bandura (1977)",
    });
    await waitFor(() => {
      expect(screen.getByText("Sosial")).toBeInTheDocument();
    });
  });

  it("harus mengirim null untuk field kisi-kisi yang dikosongkan", async () => {
    const newDomain: DomainResponse = {
      id: "dom-6",
      instrument_id: "inst-1",
      name: "Tanpa Kisi",
      construct_definition: null,
      behavioral_indicator_example: null,
      theory_reference: null,
      created_at: "2024-06-01T00:00:00Z",
      updated_at: "2024-06-01T00:00:00Z",
    };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => newDomain });
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah domain/i }));
    fireEvent.change(screen.getByPlaceholderText(/nama domain/i), {
      target: { value: "Tanpa Kisi" },
    });
    fireEvent.click(screen.getByRole("button", { name: /simpan domain/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.construct_definition).toBeNull();
    expect(body.behavioral_indicator_example).toBeNull();
    expect(body.theory_reference).toBeNull();
  });

  it("harus menampilkan error saat tambah domain gagal dari server", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Domain sudah ada" }),
    });
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah domain/i }));
    fireEvent.change(screen.getByPlaceholderText(/nama domain/i), {
      target: { value: "Kognitif" },
    });
    fireEvent.click(screen.getByRole("button", { name: /simpan domain/i }));
    await waitFor(() => {
      expect(screen.getByText("Domain sudah ada")).toBeInTheDocument();
    });
  });

  it("harus masuk mode edit dengan field terisi saat tombol edit diklik", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    fireEvent.click(screen.getAllByTitle("Edit")[0]);
    expect(screen.getByDisplayValue("Kognitif")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Definisi konstruk kognitif.")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Contoh indikator kognitif.")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Bloom (1956)")).toBeInTheDocument();
  });

  it("harus membatalkan edit saat tombol Batal diklik", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    fireEvent.click(screen.getAllByTitle("Edit")[0]);
    fireEvent.click(screen.getByRole("button", { name: /batal/i }));
    expect(screen.queryByDisplayValue("Kognitif")).not.toBeInTheDocument();
  });

  it("harus berhasil menyimpan edit domain via PATCH", async () => {
    const updatedDomain = { ...mockDomains[0], name: "Kognitif Diperbarui" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedDomain,
    });
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    fireEvent.click(screen.getAllByTitle("Edit")[0]);
    fireEvent.change(screen.getByDisplayValue("Kognitif"), {
      target: { value: "Kognitif Diperbarui" },
    });
    fireEvent.click(screen.getByRole("button", { name: /simpan domain/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/instruments/inst-1/domains/${mockDomains[0].id}`),
        expect.objectContaining({ method: "PATCH" }),
      );
    });
    await waitFor(() => {
      expect(screen.getByText("Kognitif Diperbarui")).toBeInTheDocument();
    });
  });

  it("harus menampilkan error jika nama domain edit kosong", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    fireEvent.click(screen.getAllByTitle("Edit")[0]);
    fireEvent.change(screen.getByDisplayValue("Kognitif"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /simpan domain/i }));
    expect(screen.getByText(/nama domain tidak boleh kosong/i)).toBeInTheDocument();
  });

  it("harus meminta konfirmasi sebelum menghapus domain", () => {
    mockConfirm.mockReturnValue(false);
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    fireEvent.click(screen.getAllByTitle("Hapus")[0]);
    expect(mockConfirm).toHaveBeenCalledWith(expect.stringContaining("Kognitif"));
  });

  it("harus berhasil menghapus domain setelah konfirmasi", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    fireEvent.click(screen.getAllByTitle("Hapus")[0]);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/instruments/inst-1/domains/${mockDomains[0].id}`),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
    await waitFor(() => {
      expect(screen.queryByText("Kognitif")).not.toBeInTheDocument();
    });
  });

  it("harus menampilkan error saat hapus domain gagal", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Domain tidak dapat dihapus" }),
    });
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    fireEvent.click(screen.getAllByTitle("Hapus")[0]);
    await waitFor(() => {
      expect(screen.getByText("Domain tidak dapat dihapus")).toBeInTheDocument();
    });
  });

  it("harus menampilkan error saat edit domain gagal", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Domain tidak ditemukan" }),
    });
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    fireEvent.click(screen.getAllByTitle("Edit")[0]);
    fireEvent.change(screen.getByDisplayValue("Kognitif"), {
      target: { value: "Kognitif Diperbarui" },
    });
    fireEvent.click(screen.getByRole("button", { name: /simpan domain/i }));
    await waitFor(() => {
      expect(screen.getByText("Domain tidak ditemukan")).toBeInTheDocument();
    });
  });

  it("harus mendukung submit tambah domain dengan tombol Enter", async () => {
    const newDomain: DomainResponse = {
      id: "dom-5",
      instrument_id: "inst-1",
      name: "EnterDomain",
      construct_definition: null,
      behavioral_indicator_example: null,
      theory_reference: null,
      created_at: "2024-05-01T00:00:00Z",
      updated_at: "2024-05-01T00:00:00Z",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newDomain,
    });
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah domain/i }));
    const input = screen.getByPlaceholderText(/nama domain/i);
    fireEvent.change(input, { target: { value: "EnterDomain" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/instruments/inst-1/domains",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("harus membatalkan form dengan tombol Escape pada input nama", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    fireEvent.click(screen.getAllByTitle("Edit")[0]);
    const input = screen.getByDisplayValue("Kognitif");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByDisplayValue("Kognitif")).not.toBeInTheDocument();
  });
});
