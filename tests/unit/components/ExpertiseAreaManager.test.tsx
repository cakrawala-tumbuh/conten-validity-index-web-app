/**
 * Unit test untuk komponen ExpertiseAreaManager.
 *
 * Menguji rendering daftar, penambahan, pengeditan, dan penghapusan bidang
 * keahlian pada daftar master oleh admin.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExpertiseAreaManager } from "@/components/features/expertise-areas/ExpertiseAreaManager";
import type { ExpertiseAreaResponse } from "@/types/expertise-area";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockConfirm = jest.fn();
global.confirm = mockConfirm;

const mockAreas: ExpertiseAreaResponse[] = [
  {
    id: "area-1",
    name: "Psikologi Pendidikan",
    description: "Proses belajar",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

describe("ExpertiseAreaManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("harus menampilkan daftar bidang keahlian", () => {
    render(<ExpertiseAreaManager initialAreas={mockAreas} />);
    expect(screen.getByText("Psikologi Pendidikan")).toBeInTheDocument();
    expect(screen.getByText("Proses belajar")).toBeInTheDocument();
  });

  it("harus menampilkan empty state jika belum ada bidang keahlian", () => {
    render(<ExpertiseAreaManager initialAreas={[]} />);
    expect(screen.getByText(/belum ada bidang keahlian/i)).toBeInTheDocument();
  });

  it("harus menampilkan form tambah saat tombol tambah diklik", () => {
    render(<ExpertiseAreaManager initialAreas={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah bidang keahlian/i }));
    expect(screen.getByPlaceholderText(/psikologi pendidikan/i)).toBeInTheDocument();
  });

  it("harus menampilkan error jika nama kosong saat simpan", () => {
    render(<ExpertiseAreaManager initialAreas={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah bidang keahlian/i }));
    fireEvent.click(screen.getByRole("button", { name: /^simpan$/i }));
    expect(screen.getByText(/nama bidang keahlian tidak boleh kosong/i)).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("harus mengirim POST saat menambah bidang keahlian baru", async () => {
    const created: ExpertiseAreaResponse = {
      id: "area-2",
      name: "Statistika",
      description: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => created });
    render(<ExpertiseAreaManager initialAreas={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah bidang keahlian/i }));
    fireEvent.change(screen.getByPlaceholderText(/psikologi pendidikan/i), {
      target: { value: "Statistika" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^simpan$/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/expertise-areas",
        expect.objectContaining({ method: "POST" }),
      );
    });
    expect(await screen.findByText("Statistika")).toBeInTheDocument();
  });

  it("harus mengirim PATCH saat mengedit bidang keahlian", async () => {
    const updated = { ...mockAreas[0], name: "Psikologi" };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => updated });
    render(<ExpertiseAreaManager initialAreas={mockAreas} />);
    fireEvent.click(screen.getByTitle("Edit"));
    const nameInput = screen.getByDisplayValue("Psikologi Pendidikan");
    fireEvent.change(nameInput, { target: { value: "Psikologi" } });
    fireEvent.click(screen.getByRole("button", { name: /^simpan$/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/expertise-areas/area-1",
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });

  it("harus menghapus bidang keahlian setelah konfirmasi", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: "ok" }) });
    render(<ExpertiseAreaManager initialAreas={mockAreas} />);
    fireEvent.click(screen.getByTitle("Hapus"));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/expertise-areas/area-1",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  it("harus membatalkan hapus jika konfirmasi ditolak", () => {
    mockConfirm.mockReturnValue(false);
    render(<ExpertiseAreaManager initialAreas={mockAreas} />);
    fireEvent.click(screen.getByTitle("Hapus"));
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
