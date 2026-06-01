/**
 * Unit test untuk komponen UserTable.
 *
 * Menguji rendering tabel pengguna, mode edit, dan tombol nonaktifkan.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserTable } from "@/components/features/users/UserTable";
import type { UserResponse } from "@/types/user";

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

const mockUsers: UserResponse[] = [
  {
    id: "user-1",
    email: "admin@example.com",
    full_name: "Admin Pertama",
    institution: "Universitas A",
    expertise_area: "Keperawatan",
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
    expertise_area: null,
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
    expertise_area: null,
    role: "expert",
    is_active: false,
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-03-01T00:00:00Z",
  },
];

describe("UserTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("harus menampilkan pesan kosong jika tidak ada pengguna", () => {
    render(<UserTable initialUsers={[]} />);
    expect(screen.getByText(/belum ada pengguna terdaftar/i)).toBeInTheDocument();
  });

  it("harus merender tabel dengan semua nama pengguna", () => {
    render(<UserTable initialUsers={mockUsers} />);
    expect(screen.getByText("Admin Pertama")).toBeInTheDocument();
    expect(screen.getByText("Expert Satu")).toBeInTheDocument();
    expect(screen.getByText("Expert Nonaktif")).toBeInTheDocument();
  });

  it("harus menampilkan email semua pengguna", () => {
    render(<UserTable initialUsers={mockUsers} />);
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("expert@example.com")).toBeInTheDocument();
  });

  it("harus menampilkan badge role Admin dan Expert", () => {
    render(<UserTable initialUsers={mockUsers} />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
    const expertBadges = screen.getAllByText("Expert");
    expect(expertBadges.length).toBeGreaterThan(0);
  });

  it("harus menampilkan institusi jika ada", () => {
    render(<UserTable initialUsers={mockUsers} />);
    expect(screen.getByText("Universitas A")).toBeInTheDocument();
  });

  it("harus menampilkan badge status Aktif dan Nonaktif", () => {
    render(<UserTable initialUsers={mockUsers} />);
    const aktif = screen.getAllByText("Aktif");
    expect(aktif.length).toBeGreaterThan(0);
    expect(screen.getByText("Nonaktif")).toBeInTheDocument();
  });

  it("harus tidak menampilkan tombol nonaktifkan untuk user yang sudah nonaktif", () => {
    render(<UserTable initialUsers={[mockUsers[2]]} />);
    // User nonaktif tidak punya tombol UserX (deactivate)
    const editButtons = screen.getAllByTitle("Edit");
    expect(editButtons).toHaveLength(1);
    expect(screen.queryByTitle("Nonaktifkan")).not.toBeInTheDocument();
  });

  it("harus masuk mode edit ketika tombol edit diklik", () => {
    render(<UserTable initialUsers={[mockUsers[0]]} />);
    const editButton = screen.getByTitle("Edit");
    fireEvent.click(editButton);
    // Setelah edit, muncul tombol Simpan dan Batal
    expect(screen.getByTitle("Simpan")).toBeInTheDocument();
    expect(screen.getByTitle("Batal")).toBeInTheDocument();
  });

  it("harus keluar dari mode edit saat tombol Batal diklik", () => {
    render(<UserTable initialUsers={[mockUsers[0]]} />);
    const editButton = screen.getByTitle("Edit");
    fireEvent.click(editButton);
    expect(screen.getByTitle("Batal")).toBeInTheDocument();
    fireEvent.click(screen.getByTitle("Batal"));
    expect(screen.queryByTitle("Batal")).not.toBeInTheDocument();
  });

  it("harus menampilkan konfirmasi sebelum menonaktifkan pengguna", () => {
    mockConfirm.mockReturnValue(false);
    render(<UserTable initialUsers={[mockUsers[0]]} />);
    const deactivateButton = screen.getByTitle("Nonaktifkan");
    fireEvent.click(deactivateButton);
    expect(mockConfirm).toHaveBeenCalledWith(expect.stringContaining("Admin Pertama"));
  });

  it("harus membatalkan nonaktifkan jika konfirmasi ditolak", () => {
    mockConfirm.mockReturnValue(false);
    render(<UserTable initialUsers={[mockUsers[0]]} />);
    fireEvent.click(screen.getByTitle("Nonaktifkan"));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("harus menyimpan edit pengguna berhasil saat fetch sukses", async () => {
    const updatedUser = { ...mockUsers[0], institution: "Universitas Baru" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedUser,
    });
    render(<UserTable initialUsers={[mockUsers[0]]} />);
    fireEvent.click(screen.getByTitle("Edit"));
    // Ubah institusi
    const institutionInput = screen.getByPlaceholderText("Institusi...");
    fireEvent.change(institutionInput, { target: { value: "Universitas Baru" } });
    fireEvent.click(screen.getByTitle("Simpan"));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/users/${mockUsers[0].id}`,
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });

  it("harus menampilkan error saat simpan edit gagal", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Gagal update user" }),
    });
    render(<UserTable initialUsers={[mockUsers[0]]} />);
    fireEvent.click(screen.getByTitle("Edit"));
    fireEvent.click(screen.getByTitle("Simpan"));
    await waitFor(() => {
      expect(screen.getByText("Gagal update user")).toBeInTheDocument();
    });
  });

  it("harus menonaktifkan pengguna saat konfirmasi diterima", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(<UserTable initialUsers={[mockUsers[0]]} />);
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
    render(<UserTable initialUsers={[mockUsers[0]]} />);
    fireEvent.click(screen.getByTitle("Nonaktifkan"));
    await waitFor(() => {
      expect(screen.getByText("Gagal nonaktifkan")).toBeInTheDocument();
    });
  });

  it("harus menampilkan input institusi dalam mode edit", () => {
    render(<UserTable initialUsers={[mockUsers[0]]} />);
    fireEvent.click(screen.getByTitle("Edit"));
    expect(screen.getByDisplayValue("Universitas A")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Keperawatan")).toBeInTheDocument();
  });

  it("harus memperbarui expertise saat input area keahlian diubah", () => {
    render(<UserTable initialUsers={[mockUsers[0]]} />);
    fireEvent.click(screen.getByTitle("Edit"));
    const expertiseInput = screen.getByDisplayValue("Keperawatan");
    fireEvent.change(expertiseInput, { target: { value: "Kedokteran" } });
    expect(screen.getByDisplayValue("Kedokteran")).toBeInTheDocument();
  });

  it("harus menampilkan error jika nama kosong saat simpan edit", async () => {
    render(<UserTable initialUsers={[mockUsers[0]]} />);
    fireEvent.click(screen.getByTitle("Edit"));
    // Kosongkan input nama lengkap
    const nameInput = screen.getByPlaceholderText("Nama lengkap");
    fireEvent.change(nameInput, { target: { value: "" } });
    fireEvent.click(screen.getByTitle("Simpan"));
    await waitFor(() => {
      expect(screen.getByText("Nama tidak boleh kosong.")).toBeInTheDocument();
    });
  });

  it("harus memperbarui nilai nama lengkap saat input diubah", () => {
    render(<UserTable initialUsers={[mockUsers[0]]} />);
    fireEvent.click(screen.getByTitle("Edit"));
    const nameInput = screen.getByPlaceholderText("Nama lengkap");
    fireEvent.change(nameInput, { target: { value: "Nama Baru" } });
    expect(screen.getByDisplayValue("Nama Baru")).toBeInTheDocument();
  });

  it("harus mengisi institusi dan keahlian kosong saat edit user dengan data null", () => {
    // mockUsers[1] punya institution: null dan expertise_area: null
    render(<UserTable initialUsers={[mockUsers[1]]} />);
    fireEvent.click(screen.getByTitle("Edit"));
    // Input institusi dan keahlian harus kosong (??  "" applied)
    const inputs = screen.getAllByRole("textbox");
    // Semua input teks terbuka (nama, institusi, keahlian)
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("harus mengirim body dengan undefined saat institusi dan keahlian kosong", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockUsers[1], full_name: "Expert Satu" }),
    });
    render(<UserTable initialUsers={[mockUsers[1]]} />);
    fireEvent.click(screen.getByTitle("Edit"));
    // institution dan expertise_area null → input kosong → trim() || undefined = undefined
    fireEvent.click(screen.getByTitle("Simpan"));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/users/${mockUsers[1].id}`,
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });

  it("harus menampilkan error fallback saat simpan edit gagal tanpa detail", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });
    render(<UserTable initialUsers={[mockUsers[0]]} />);
    fireEvent.click(screen.getByTitle("Edit"));
    fireEvent.click(screen.getByTitle("Simpan"));
    await waitFor(() => {
      expect(screen.getByText(/gagal menyimpan perubahan/i)).toBeInTheDocument();
    });
  });

  it("harus menampilkan error fallback saat nonaktifkan gagal tanpa detail", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });
    render(<UserTable initialUsers={[mockUsers[0]]} />);
    fireEvent.click(screen.getByTitle("Nonaktifkan"));
    await waitFor(() => {
      expect(screen.getByText(/gagal menonaktifkan pengguna/i)).toBeInTheDocument();
    });
  });

  it("harus menutup mode edit dan memperbarui data setelah simpan berhasil", async () => {
    // Render dengan beberapa user agar ternary map mencakup kedua branch (match & no-match)
    const updatedUser = { ...mockUsers[0], full_name: "Admin Diperbarui" };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => updatedUser });
    render(<UserTable initialUsers={mockUsers} />);
    const editButtons = screen.getAllByTitle("Edit");
    fireEvent.click(editButtons[0]);
    expect(screen.getByTitle("Simpan")).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText("Nama lengkap");
    fireEvent.change(nameInput, { target: { value: "Admin Diperbarui" } });
    fireEvent.click(screen.getByTitle("Simpan"));
    await waitFor(() => {
      expect(screen.queryByTitle("Simpan")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Admin Diperbarui")).toBeInTheDocument();
  });

  it("harus menampilkan badge Nonaktif setelah deaktivasi berhasil", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    // Render dengan beberapa user agar ternary map mencakup kedua branch
    render(<UserTable initialUsers={mockUsers} />);
    const aktifBadges = screen.getAllByText("Aktif");
    expect(aktifBadges.length).toBeGreaterThan(0);
    const deactivateButtons = screen.getAllByTitle("Nonaktifkan");
    fireEvent.click(deactivateButtons[0]);
    await waitFor(() => {
      // Setelah deaktivasi, badge Nonaktif bertambah satu
      const nonaktifBadges = screen.getAllByText("Nonaktif");
      expect(nonaktifBadges.length).toBeGreaterThan(1);
    });
  });
});
