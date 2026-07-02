/**
 * Unit test untuk komponen AssignmentList.
 *
 * Menguji rendering daftar assignment, tampilan state kosong,
 * dan tombol aksi untuk setiap assignment.
 */
import { render, screen } from "@testing-library/react";
import { AssignmentList } from "@/components/features/assignments/AssignmentList";
import type { AssignmentResponse } from "@/types/expert-assignment";

// Mock next/link
jest.mock("next/link", () => {
  const MockLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = "Link";
  return MockLink;
});

const mockAssignments: AssignmentResponse[] = [
  {
    id: "asgn-1",
    instrument_id: "inst-abcdefgh",
    instrument_name: "Skala Motivasi Belajar",
    user_id: "user-1",
    assigned_by: "admin-1",
    deadline: null,
    status: "pending",
    assigned_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    previous_assignment_id: null,
    revision_number: 1,
    is_active: true,
  },
  {
    id: "asgn-2",
    instrument_id: "inst-12345678",
    instrument_name: null,
    user_id: "user-1",
    assigned_by: "admin-1",
    deadline: null,
    status: "in_progress",
    assigned_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
    previous_assignment_id: null,
    revision_number: 1,
    is_active: true,
  },
];

describe("AssignmentList", () => {
  it("harus menampilkan pesan kosong jika tidak ada assignment", () => {
    render(<AssignmentList assignments={[]} />);
    expect(screen.getByText(/belum ada instrumen yang ditugaskan/i)).toBeInTheDocument();
  });

  it("harus menampilkan nama instrumen jika tersedia", () => {
    render(<AssignmentList assignments={[mockAssignments[0]]} />);
    expect(screen.getByText("Skala Motivasi Belajar")).toBeInTheDocument();
  });

  it("harus fallback ke ID instrumen jika nama tidak tersedia", () => {
    render(<AssignmentList assignments={[mockAssignments[1]]} />);
    // instrument_name null → fallback "Instrumen #" + instrument_id.slice(0, 8)
    expect(screen.getByText(/Instrumen #inst-123/)).toBeInTheDocument();
  });

  it("harus menampilkan tombol 'Mulai' untuk assignment pending", () => {
    render(<AssignmentList assignments={[mockAssignments[0]]} />);
    expect(screen.getByRole("link", { name: /mulai/i })).toBeInTheDocument();
  });

  it("harus menampilkan tombol 'Lanjutkan' untuk assignment in_progress", () => {
    render(<AssignmentList assignments={[mockAssignments[1]]} />);
    expect(screen.getByRole("link", { name: /lanjutkan/i })).toBeInTheDocument();
  });

  it("harus menampilkan label status 'Menunggu' untuk pending", () => {
    render(<AssignmentList assignments={[mockAssignments[0]]} />);
    expect(screen.getByText("Menunggu")).toBeInTheDocument();
  });

  it("harus menampilkan label status 'Sedang Berjalan' untuk in_progress", () => {
    render(<AssignmentList assignments={[mockAssignments[1]]} />);
    expect(screen.getByText("Sedang Berjalan")).toBeInTheDocument();
  });
});
