/**
 * Unit test untuk komponen UserTable.
 *
 * Menguji rendering tabel pengguna, mode edit (institusi + bidang keahlian),
 * dan tombol nonaktifkan.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserTable } from "@/components/features/users/UserTable";
import type { UserResponse } from "@/types/user";
import type { ExpertiseAreaResponse } from "@/types/expertise-area";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock window.confirm
const mockConfirm = jest.fn();
global.confirm = mockConfirm;

const mockOptions: ExpertiseAreaResponse[] = [
  {
    id: "area-1",
    name: "Keperawatan",
    description: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "area-2",
    name: "Kedokteran",
    description: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

const mockUsers: UserResponse[] = [
  {
    id: "user-1",
    email: "admin@example.com",
    full_name: "Admin Pertama",
    institution: "Universitas A",
    expertise_areas: [mockOptions[0]],
    role: "admin",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    email: "expert@example.com",
    full_name: "Expert Satu",
    institution: null,
    expertise_areas: [],
    role: "expert",
    is_active: true,
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "user-3",
    email: "inactive@example.com",
    full_name: "Expert Nonaktif",
    institution: null,
    expertise_areas: [],
    role: "expert",
    is_active: false,
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-03-01T00:00:00Z",
  },
];

/**
 * Merender UserTable dengan opsi keahlian default.
 */
const renderTable = (users: UserResponse[]) =>
  render(<UserTable initialUsers={users} expertiseAreaOptions={mockOptions} />);

describe("UserTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("harus menampilkan pesan kosong jika tidak ada pengguna", () => {
    renderTable([]);
    expect(screen.getByText(/belum ada pengguna terdaftar/i)).toBeInTheDocument();
  });

  it("harus merender tabel dengan semua nama pengguna", () => {
    renderTable(mockUsers);
    expect(screen.getByText("Admin Pertama")).toBeInTheDocument();
    expect(screen.getByText("Expert Satu")).toBeInTheDocument();
    expect(screen.getByText("Expert Nonaktif")).toBeInTheDocument();
  });

  it("harus menampilkan email semua pengguna", () => {
    renderTable(mockUsers);
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("expert@example.com")).toBeInTheDocument();
  });

  it("harus menampilkan badge role Admin dan Expert", () => {
    renderTable(mockUsers);
    expect(screen.getByText("Admin")).toBeInTheDocument();
    const expertBadges = screen.getAllByText("Expert");
    expect(expertBadges.length).toBeGreaterThan(0);
  });

  it("harus menampilkan institusi jika ada", () => {
    renderTable(mockUsers);
    expect(screen.getByText("Universitas A")).toBeInTheDocument();
  });

  it("harus menampilkan bidang keahlian sebagai chip", () => {
    renderTable([mockUsers[0]]);
    expect(screen.getByText("Keperawatan")).toBeInTheDocument();
  });

  it("harus menampilkan placeholder bila pengguna belum punya keahlian", () => {
    renderTable([mockUsers[1]]);
    expect(screen.getByText(/belum ada keahlian/i)).toBeInTheDocument();
  });

  it("harus menampilkan badge status Aktif dan Nonaktif", () => {
    renderTable(mockUsers);
    const aktif = screen.getAllByText("Aktif");
    expect(aktif.length).toBeGreaterThan(0);
    expect(screen.getByText("Nonaktif")).toBeInTheDocument();
  });

  it("harus tidak menampilkan tombol nonaktifkan untuk user yang sudah nonaktif", () => {
    renderTable([mockUsers[2]]);
    const editButtons = screen.getAllByTitle("Edit");
    expect(editButtons).toHaveLength(1);
    expect(screen.queryByTitle("Nonaktifkan")).not.toBeInTheDocument();
  });

  it("harus masuk mode edit ketika tombol edit diklik", () => {
    renderTable([mockUsers[0]]);
    fireEvent.click(screen.getByTitle("Edit"));
    expect(screen.getByTitle("Simpan")).toBeInTheDocument();
    expect(screen.getByTitle("Batal")).toBeInTheDocument();
  });

  it("harus keluar dari mode edit saat tombol Batal diklik", () => {
    renderTable([mockUsers[0]]);
    fireEvent.click(screen.getByTitle("Edit"));
    expect(screen.getByTitle("Batal")).toBeInTheDocument();
    fireEvent.click(screen.getByTitle("Batal"));
    expect(screen.queryByTitle("Batal")).not.toBeInTheDocument();
  });

  it("harus menampilkan input institusi dan keahlian terpilih dalam mode edit", () => {
    renderTable([mockUsers[0]]);
    fireEvent.click(screen.getByTitle("Edit"));
    expect(screen.getByDisplayValue("Universitas A")).toBeInTheDocument();
    // Keahlian yang sudah dimiliki tampil tercentang.
    expect(screen.getByRole("checkbox", { name: /keperawatan/i })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /kedokteran/i })).not.toBeChecked();
  });

  it("harus memperbarui pilihan keahlian saat checkbox di-toggle", () => {
    renderTable([mockUsers[0]]);
    fireEvent.click(screen.getByTitle("Edit"));
    const kedokteran = screen.getByRole("checkbox", { name: /kedokteran/i });
    fireEvent.click(kedokteran);
    expect(kedokteran).toBeChecked();
  });

  it("harus menampilkan konfirmasi sebelum menonaktifkan pengguna", () => {
    mockConfirm.mockReturnValue(false);
    renderTable([mockUsers[0]]);
    fireEvent.click(screen.getByTitle("Nonaktifkan"));
    expect(mockConfirm).toHaveBeenCalledWith(expect.stringContaining("Admin Pertama"));
  });

  it("harus membatalkan nonaktifkan jika konfirmasi ditolak", () => {
    mockConfirm.mockReturnValue(false);
    renderTable([mockUsers[0]]);
    fireEvent.click(screen.getByTitle("Nonaktifkan"));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("harus menyimpan edit dengan institusi & expertise_area_ids saat fetch sukses", async () => {
    const updatedUser = { ...mockUsers[0], institution: "Universitas Baru" };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => updatedUser });
    renderTable([mockUsers[0]]);
    fireEvent.click(screen.getByTitle("Edit"));
    const institutionInput = screen.getByPlaceholderText("Institusi...");
    fireEvent.change(institutionInput, { target: { value: "Universitas Baru" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /kedokteran/i }));
    fireEvent.click(screen.getByTitle("Simpan"));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/users/${mockUsers[0].id}`,
        expect.objectContaining({ method: "PATCH" }),
      );
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.institution).toBe("Universitas Baru");
    expect(body.expertise_area_ids).toEqual(["area-1", "area-2"]);
  });

  it("harus menampilkan error saat simpan edit gagal", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Gagal update user" }),
    });
    renderTable([mockUsers[0]]);
    fireEvent.click(screen.getByTitle("Edit"));
    fireEvent.click(screen.getByTitle("Simpan"));
    await waitFor(() => {
      expect(screen.getByText("Gagal update user")).toBeInTheDocument();
    });
  });

  it("harus menonaktifkan pengguna saat konfirmasi diterima", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    renderTable([mockUsers[0]]);
    fireEvent.click(screen.getByTitle("Nonaktifkan"));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/users/${mockUsers[0].id}`,
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  it("harus menampilkan error saat nonaktifkan gagal", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Gagal nonaktifkan" }),
    });
    renderTable([mockUsers[0]]);
    fireEvent.click(screen.getByTitle("Nonaktifkan"));
    await waitFor(() => {
      expect(screen.getByText("Gagal nonaktifkan")).toBeInTheDocument();
    });
  });

  it("harus mengirim body dengan undefined institusi saat data kosong", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockUsers[1] }),
    });
    renderTable([mockUsers[1]]);
    fireEvent.click(screen.getByTitle("Edit"));
    fireEvent.click(screen.getByTitle("Simpan"));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/users/${mockUsers[1].id}`,
        expect.objectContaining({ method: "PATCH" }),
      );
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.institution).toBeUndefined();
    expect(body.expertise_area_ids).toEqual([]);
  });

  it("harus menampilkan error fallback saat simpan edit gagal tanpa detail", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    renderTable([mockUsers[0]]);
    fireEvent.click(screen.getByTitle("Edit"));
    fireEvent.click(screen.getByTitle("Simpan"));
    await waitFor(() => {
      expect(screen.getByText(/gagal menyimpan perubahan/i)).toBeInTheDocument();
    });
  });

  it("harus menampilkan error fallback saat nonaktifkan gagal tanpa detail", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    renderTable([mockUsers[0]]);
    fireEvent.click(screen.getByTitle("Nonaktifkan"));
    await waitFor(() => {
      expect(screen.getByText(/gagal menonaktifkan pengguna/i)).toBeInTheDocument();
    });
  });

  it("harus menutup mode edit dan memperbarui data setelah simpan berhasil", async () => {
    const updatedUser = { ...mockUsers[0], institution: "Universitas Diperbarui" };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => updatedUser });
    renderTable(mockUsers);
    const editButtons = screen.getAllByTitle("Edit");
    fireEvent.click(editButtons[0]);
    expect(screen.getByTitle("Simpan")).toBeInTheDocument();
    const institutionInput = screen.getByPlaceholderText("Institusi...");
    fireEvent.change(institutionInput, { target: { value: "Universitas Diperbarui" } });
    fireEvent.click(screen.getByTitle("Simpan"));
    await waitFor(() => {
      expect(screen.queryByTitle("Simpan")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Universitas Diperbarui")).toBeInTheDocument();
  });

  it("harus menampilkan badge Nonaktif setelah deaktivasi berhasil", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    renderTable(mockUsers);
    const aktifBadges = screen.getAllByText("Aktif");
    expect(aktifBadges.length).toBeGreaterThan(0);
    const deactivateButtons = screen.getAllByTitle("Nonaktifkan");
    fireEvent.click(deactivateButtons[0]);
    await waitFor(() => {
      const nonaktifBadges = screen.getAllByText("Nonaktif");
      expect(nonaktifBadges.length).toBeGreaterThan(1);
    });
  });
});
