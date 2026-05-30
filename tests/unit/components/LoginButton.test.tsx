/**
 * Unit test untuk komponen LoginButton.
 *
 * Menguji rendering, tampilan teks, dan interaksi klik tombol login.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginButton } from "@/components/features/auth/LoginButton";

// Mock next-auth/react
const mockSignIn = jest.fn();
jest.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

beforeEach(() => {
  mockSignIn.mockReset();
});

describe("LoginButton", () => {
  it("harus merender tombol dengan teks 'Masuk dengan Authentik'", () => {
    render(<LoginButton />);
    expect(screen.getByRole("button", { name: /masuk dengan authentik/i })).toBeInTheDocument();
  });

  it("harus memanggil signIn('authentik') saat diklik", async () => {
    mockSignIn.mockResolvedValueOnce(undefined);
    render(<LoginButton />);

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("authentik", { callbackUrl: "/" });
    });
  });

  it("harus menampilkan teks loading saat proses login", async () => {
    // signIn tidak resolve segera agar loading state terlihat
    mockSignIn.mockReturnValueOnce(new Promise(() => {}));
    render(<LoginButton />);

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText(/mengalihkan/i)).toBeInTheDocument();
    });
  });

  it("harus menonaktifkan tombol saat loading", async () => {
    mockSignIn.mockReturnValueOnce(new Promise(() => {}));
    render(<LoginButton />);

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });
});
