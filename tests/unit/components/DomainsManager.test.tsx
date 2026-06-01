/**
 * Unit test untuk komponen DomainsManager.
 *
 * Menguji rendering daftar domain, state kosong, mode tambah, edit,
 * dan hapus domain.
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
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dom-2",
    instrument_id: "inst-1",
    name: "Afektif",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "dom-3",
    instrument_id: "inst-1",
    name: "Psikomotor",
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

  it("harus menampilkan tombol Tambah Domain", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={[]} />);
    expect(screen.getByRole("button", { name: /tambah domain/i })).toBeInTheDocument();
  });

  it("harus menampilkan form tambah domain setelah klik Tambah Domain", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah domain/i }));
    expect(screen.getByPlaceholderText(/nama domain/i)).toBeInTheDocument();
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

  it("harus berhasil menambahkan domain baru", async () => {
    const newDomain: DomainResponse = {
      id: "dom-4",
      instrument_id: "inst-1",
      name: "Sosial",
      created_at: "2024-04-01T00:00:00Z",
      updated_at: "2024-04-01T00:00:00Z",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newDomain,
    });
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah domain/i }));
    const input = screen.getByPlaceholderText(/nama domain/i);
    fireEvent.change(input, { target: { value: "Sosial" } });
    fireEvent.click(screen.getByRole("button", { name: /simpan domain/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/instruments/inst-1/domains",
        expect.objectContaining({ method: "POST" }),
      );
    });
    await waitFor(() => {
      expect(screen.getByText("Sosial")).toBeInTheDocument();
    });
  });

  it("harus menampilkan error saat tambah domain gagal dari server", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Domain sudah ada" }),
    });
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah domain/i }));
    const input = screen.getByPlaceholderText(/nama domain/i);
    fireEvent.change(input, { target: { value: "Kognitif" } });
    fireEvent.click(screen.getByRole("button", { name: /simpan domain/i }));
    await waitFor(() => {
      expect(screen.getByText("Domain sudah ada")).toBeInTheDocument();
    });
  });

  it("harus masuk mode edit saat tombol edit domain diklik", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    const editButtons = screen.getAllByTitle("Edit");
    fireEvent.click(editButtons[0]);
    // Input edit dengan nilai dari domain pertama harus muncul
    expect(screen.getByDisplayValue("Kognitif")).toBeInTheDocument();
  });

  it("harus membatalkan edit saat tombol Batal diklik", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    const editButtons = screen.getAllByTitle("Edit");
    fireEvent.click(editButtons[0]);
    fireEvent.click(screen.getByTitle("Batal"));
    // Setelah batal, tidak ada input edit
    expect(screen.queryByDisplayValue("Kognitif")).not.toBeInTheDocument();
  });

  it("harus berhasil menyimpan edit nama domain", async () => {
    const updatedDomain = { ...mockDomains[0], name: "Kognitif Diperbarui" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedDomain,
    });
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    const editButtons = screen.getAllByTitle("Edit");
    fireEvent.click(editButtons[0]);
    const input = screen.getByDisplayValue("Kognitif");
    fireEvent.change(input, { target: { value: "Kognitif Diperbarui" } });
    fireEvent.click(screen.getByTitle("Simpan"));
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
    const editButtons = screen.getAllByTitle("Edit");
    fireEvent.click(editButtons[0]);
    const input = screen.getByDisplayValue("Kognitif");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(screen.getByTitle("Simpan"));
    expect(screen.getByText(/nama domain tidak boleh kosong/i)).toBeInTheDocument();
  });

  it("harus tidak melakukan apa-apa jika nama domain edit sama dengan sebelumnya", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    const editButtons = screen.getAllByTitle("Edit");
    fireEvent.click(editButtons[0]);
    fireEvent.click(screen.getByTitle("Simpan"));
    // Tidak ada fetch yang dipanggil
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("harus meminta konfirmasi sebelum menghapus domain", () => {
    mockConfirm.mockReturnValue(false);
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    const deleteButtons = screen.getAllByTitle("Hapus");
    fireEvent.click(deleteButtons[0]);
    expect(mockConfirm).toHaveBeenCalledWith(
      expect.stringContaining("Kognitif"),
    );
  });

  it("harus berhasil menghapus domain setelah konfirmasi", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    const deleteButtons = screen.getAllByTitle("Hapus");
    fireEvent.click(deleteButtons[0]);
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
    const deleteButtons = screen.getAllByTitle("Hapus");
    fireEvent.click(deleteButtons[0]);
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
    const editButtons = screen.getAllByTitle("Edit");
    fireEvent.click(editButtons[0]);
    // Ubah nama agar komponen tidak melakukan early-return (nama sama = no-op)
    const input = screen.getByDisplayValue("Kognitif");
    fireEvent.change(input, { target: { value: "Kognitif Diperbarui" } });
    fireEvent.click(screen.getByTitle("Simpan"));
    await waitFor(() => {
      expect(screen.getByText("Domain tidak ditemukan")).toBeInTheDocument();
    });
  });

  it("harus mendukung submit tambah domain dengan tombol Enter", async () => {
    const newDomain: DomainResponse = {
      id: "dom-5",
      instrument_id: "inst-1",
      name: "EnterDomain",
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

  it("harus mendukung submit edit domain dengan tombol Enter", async () => {
    const updatedDomain = { ...mockDomains[0], name: "EnterEdit" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedDomain,
    });
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    fireEvent.click(screen.getAllByTitle("Edit")[0]);
    const input = screen.getByDisplayValue("Kognitif");
    fireEvent.change(input, { target: { value: "EnterEdit" } });
    // Ambil referensi input terbaru setelah state update
    const updatedInput = screen.getByDisplayValue("EnterEdit");
    fireEvent.keyDown(updatedInput, { key: "Enter" });
    await waitFor(() => {
      expect(screen.getByText("EnterEdit")).toBeInTheDocument();
    });
  });

  it("harus membatalkan edit domain dengan tombol Escape", () => {
    render(<DomainsManager instrumentId="inst-1" initialDomains={mockDomains} />);
    fireEvent.click(screen.getAllByTitle("Edit")[0]);
    const input = screen.getByDisplayValue("Kognitif");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByDisplayValue("Kognitif")).not.toBeInTheDocument();
  });
});