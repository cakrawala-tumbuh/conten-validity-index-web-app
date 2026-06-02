/**
 * Unit test untuk komponen DashboardShell.
 *
 * Menguji rendering konten, navigasi berbasis role, dan interaksi drawer
 * mobile (buka via tombol menu, tutup via overlay).
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardShell } from "@/components/features/layout/DashboardShell";

// Mock next/link agar menjadi anchor biasa
jest.mock("next/link", () => {
  const MockLink = ({
    href,
    children,
    onClick,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
  MockLink.displayName = "Link";
  return MockLink;
});

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/instruments"),
}));

// Mock next-auth/react (dipakai Header)
jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
}));

const adminUser = {
  name: "Andhit",
  email: "andhit@example.com",
  role: "admin" as const,
};

describe("DashboardShell", () => {
  it("harus merender konten children", () => {
    render(
      <DashboardShell user={adminUser}>
        <p>Konten Halaman</p>
      </DashboardShell>,
    );
    expect(screen.getByText("Konten Halaman")).toBeInTheDocument();
  });

  it("harus merender navigasi sesuai role admin", () => {
    render(
      <DashboardShell user={adminUser}>
        <p>x</p>
      </DashboardShell>,
    );
    expect(screen.getByText("Instrumen")).toBeInTheDocument();
    expect(screen.getByText("Pengguna")).toBeInTheDocument();
  });

  it("drawer tertutup secara default (tanpa overlay)", () => {
    render(
      <DashboardShell user={adminUser}>
        <p>x</p>
      </DashboardShell>,
    );
    expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument();
  });

  it("harus membuka drawer saat tombol menu diklik", () => {
    render(
      <DashboardShell user={adminUser}>
        <p>x</p>
      </DashboardShell>,
    );
    fireEvent.click(screen.getByRole("button", { name: /buka menu navigasi/i }));
    expect(screen.getByTestId("sidebar-overlay")).toBeInTheDocument();
  });

  it("harus menutup drawer saat overlay diklik", () => {
    render(
      <DashboardShell user={adminUser}>
        <p>x</p>
      </DashboardShell>,
    );
    fireEvent.click(screen.getByRole("button", { name: /buka menu navigasi/i }));
    fireEvent.click(screen.getByTestId("sidebar-overlay"));
    expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument();
  });
});
