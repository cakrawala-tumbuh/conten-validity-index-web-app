/**
 * Unit test untuk komponen Header.
 *
 * Menguji rendering nama pengguna, email, badge role,
 * dan tombol logout yang memanggil signOut.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "@/components/features/layout/Header";

// Mock next-auth/react
const mockSignOut = jest.fn();
jest.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

const mockUser = {
  name: "Andhit Rizaldy",
  email: "andhit@example.com",
  role: "admin" as const,
};

describe("Header", () => {
  beforeEach(() => {
    mockSignOut.mockClear();
  });

  it("harus menampilkan nama pengguna", () => {
    render(<Header user={mockUser} />);
    expect(screen.getByText("Andhit Rizaldy")).toBeInTheDocument();
  });

  it("harus menampilkan email jika nama tidak ada", () => {
    const userWithoutName = { ...mockUser, name: undefined };
    render(<Header user={userWithoutName} />);
    expect(screen.getByText("andhit@example.com")).toBeInTheDocument();
  });

  it("harus menampilkan label role untuk admin", () => {
    render(<Header user={mockUser} />);
    // USER_ROLE_LABELS["admin"] berisi label role admin
    const roleText = screen.getByText(/administrator|admin/i);
    expect(roleText).toBeInTheDocument();
  });

  it("harus menampilkan label role untuk expert", () => {
    const expertUser = { ...mockUser, role: "expert" as const };
    render(<Header user={expertUser} />);
    const roleText = screen.getByText(/expert|penilai/i);
    expect(roleText).toBeInTheDocument();
  });

  it("harus memanggil signOut saat tombol logout diklik", () => {
    render(<Header user={mockUser} />);
    const logoutButton = screen.getByRole("button", { name: /keluar/i });
    fireEvent.click(logoutButton);
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });
});
