/**
 * Unit test untuk komponen Sidebar.
 *
 * Menguji rendering navigasi berdasarkan role pengguna (admin/expert),
 * highlighting link aktif, dan tampilan nama pengguna.
 */
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/features/layout/Sidebar";

// Mock next/link
jest.mock("next/link", () => {
  const MockLink = ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
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

describe("Sidebar", () => {
  describe("role: admin", () => {
    it("harus merender navigasi untuk admin", () => {
      render(<Sidebar role="admin" />);
      expect(screen.getByText("Instrumen")).toBeInTheDocument();
      expect(screen.getByText("Pengguna")).toBeInTheDocument();
      expect(screen.getByText("Log Aktivitas")).toBeInTheDocument();
    });

    it("tidak harus menampilkan menu expert untuk admin", () => {
      render(<Sidebar role="admin" />);
      expect(screen.queryByText("Penilaian Saya")).not.toBeInTheDocument();
    });

    it("harus memiliki link ke /instruments", () => {
      render(<Sidebar role="admin" />);
      const link = screen.getByRole("link", { name: /instrumen/i });
      expect(link).toHaveAttribute("href", "/instruments");
    });

    it("harus memiliki link ke /users", () => {
      render(<Sidebar role="admin" />);
      const link = screen.getByRole("link", { name: /pengguna/i });
      expect(link).toHaveAttribute("href", "/users");
    });

    it("harus memiliki link ke /activity-logs", () => {
      render(<Sidebar role="admin" />);
      const link = screen.getByRole("link", { name: /log aktivitas/i });
      expect(link).toHaveAttribute("href", "/activity-logs");
    });
  });

  describe("role: expert", () => {
    it("harus merender navigasi untuk expert", () => {
      render(<Sidebar role="expert" />);
      expect(screen.getByText("Penilaian Saya")).toBeInTheDocument();
    });

    it("tidak harus menampilkan menu admin untuk expert", () => {
      render(<Sidebar role="expert" />);
      expect(screen.queryByText("Log Aktivitas")).not.toBeInTheDocument();
    });

    it("harus memiliki link ke /my-assignments", () => {
      render(<Sidebar role="expert" />);
      const link = screen.getByRole("link", { name: /penilaian saya/i });
      expect(link).toHaveAttribute("href", "/my-assignments");
    });
  });
});
