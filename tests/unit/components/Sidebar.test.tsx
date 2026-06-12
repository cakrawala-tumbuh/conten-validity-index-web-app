/**
 * Unit test untuk komponen Sidebar.
 *
 * Menguji rendering navigasi berdasarkan role pengguna (admin/expert),
 * highlighting link aktif, dan perilaku drawer responsif (mobile).
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "@/components/features/layout/Sidebar";

// Mock next/link
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

    it("harus memiliki link ke /expertise-areas (Bidang Keahlian)", () => {
      render(<Sidebar role="admin" />);
      const link = screen.getByRole("link", { name: /bidang keahlian/i });
      expect(link).toHaveAttribute("href", "/expertise-areas");
    });

    it("harus memiliki link ke /profile (Profil Saya)", () => {
      render(<Sidebar role="admin" />);
      const link = screen.getByRole("link", { name: /profil saya/i });
      expect(link).toHaveAttribute("href", "/profile");
    });

    it("harus memiliki link ke /backup (Backup & Restore)", () => {
      render(<Sidebar role="admin" />);
      const link = screen.getByRole("link", { name: /backup & restore/i });
      expect(link).toHaveAttribute("href", "/backup");
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
      expect(screen.queryByText("Bidang Keahlian")).not.toBeInTheDocument();
    });

    it("harus memiliki link ke /my-assignments", () => {
      render(<Sidebar role="expert" />);
      const link = screen.getByRole("link", { name: /penilaian saya/i });
      expect(link).toHaveAttribute("href", "/my-assignments");
    });

    it("harus memiliki link ke /profile (Profil Saya)", () => {
      render(<Sidebar role="expert" />);
      const link = screen.getByRole("link", { name: /profil saya/i });
      expect(link).toHaveAttribute("href", "/profile");
    });
  });

  describe("perilaku drawer responsif (mobile)", () => {
    it("tidak menampilkan overlay saat tertutup (default)", () => {
      render(<Sidebar role="admin" />);
      expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument();
    });

    it("menampilkan overlay saat isOpen bernilai true", () => {
      render(<Sidebar role="admin" isOpen />);
      expect(screen.getByTestId("sidebar-overlay")).toBeInTheDocument();
    });

    it("memanggil onClose saat overlay diklik", () => {
      const onClose = jest.fn();
      render(<Sidebar role="admin" isOpen onClose={onClose} />);
      fireEvent.click(screen.getByTestId("sidebar-overlay"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("memanggil onClose saat tombol tutup diklik", () => {
      const onClose = jest.fn();
      render(<Sidebar role="admin" isOpen onClose={onClose} />);
      fireEvent.click(screen.getByRole("button", { name: /tutup menu navigasi/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("memanggil onClose saat item navigasi dipilih", () => {
      const onClose = jest.fn();
      render(<Sidebar role="admin" isOpen onClose={onClose} />);
      fireEvent.click(screen.getByRole("link", { name: /instrumen/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
