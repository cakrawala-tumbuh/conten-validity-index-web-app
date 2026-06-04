/**
 * Unit test untuk komponen ProfileForm.
 *
 * Menguji rendering field identitas pribadi, field read-only (email/role),
 * pemilihan bidang keahlian, validasi nama lengkap, serta pengiriman perubahan.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProfileForm } from "@/components/features/users/ProfileForm";
import type { UserResponse } from "@/types/user";
import type { ExpertiseAreaResponse } from "@/types/expertise-area";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockOptions: ExpertiseAreaResponse[] = [
  {
    id: "area-1",
    name: "Psikologi Pendidikan",
    description: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "area-2",
    name: "Statistika",
    description: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

const mockUser: UserResponse = {
  id: "user-1",
  email: "expert@example.com",
  full_name: "Dr. Budi Santoso",
  institution: "Universitas Indonesia",
  expertise_areas: [mockOptions[0]],
  role: "expert",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

/**
 * Merender ProfileForm dengan opsi keahlian default.
 */
const renderForm = () => render(<ProfileForm user={mockUser} expertiseAreaOptions={mockOptions} />);

describe("ProfileForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("harus menampilkan data awal pengguna pada field", () => {
    renderForm();
    expect(screen.getByDisplayValue("Dr. Budi Santoso")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Universitas Indonesia")).toBeInTheDocument();
  });

  it("harus menandai bidang keahlian yang sudah dimiliki sebagai terpilih", () => {
    renderForm();
    expect(screen.getByRole("checkbox", { name: /psikologi pendidikan/i })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /statistika/i })).not.toBeChecked();
  });

  it("harus menampilkan email dan role sebagai read-only", () => {
    renderForm();
    const emailField = screen.getByDisplayValue("expert@example.com");
    expect(emailField).toBeDisabled();
  });

  it("harus menampilkan error jika nama lengkap dikosongkan", () => {
    renderForm();
    const nameField = screen.getByDisplayValue("Dr. Budi Santoso");
    fireEvent.change(nameField, { target: { value: "   " } });
    const form = screen.getByRole("button", { name: /simpan perubahan/i }).closest("form");
    if (form) fireEvent.submit(form);
    expect(screen.getByText("Nama lengkap tidak boleh kosong.")).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("harus mengirim full_name dan expertise_area_ids saat submit valid", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockUser });
    renderForm();
    const nameField = screen.getByDisplayValue("Dr. Budi Santoso");
    fireEvent.change(nameField, { target: { value: "Dr. Budi Santoso, M.Psi." } });
    // Tambah keahlian kedua.
    fireEvent.click(screen.getByRole("checkbox", { name: /statistika/i }));
    const form = screen.getByRole("button", { name: /simpan perubahan/i }).closest("form");
    if (form) fireEvent.submit(form);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/users/me",
        expect.objectContaining({ method: "PATCH" }),
      );
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.full_name).toBe("Dr. Budi Santoso, M.Psi.");
    expect(body.expertise_area_ids).toEqual(["area-1", "area-2"]);
  });

  it("harus menampilkan pesan sukses setelah berhasil menyimpan", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockUser });
    renderForm();
    const form = screen.getByRole("button", { name: /simpan perubahan/i }).closest("form");
    if (form) fireEvent.submit(form);
    await waitFor(() => {
      expect(screen.getByText(/berhasil diperbarui/i)).toBeInTheDocument();
    });
  });

  it("harus menampilkan error dari server saat gagal menyimpan", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Nama lengkap tidak boleh kosong." }),
    });
    renderForm();
    const form = screen.getByRole("button", { name: /simpan perubahan/i }).closest("form");
    if (form) fireEvent.submit(form);
    await waitFor(() => {
      expect(screen.getByText("Nama lengkap tidak boleh kosong.")).toBeInTheDocument();
    });
  });
});
