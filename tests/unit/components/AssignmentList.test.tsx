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
    user_id: "user-1",
    assigned_by: "admin-1",
    deadline: null,
    status: "pending",
    assigned_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "asgn-2",
    instrument_id: "inst-12345678",
    user_id: "user-1",
    assigned_by: "admin-1",
    deadline: null,
    status: "in_progress",
    assigned_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
  },
];

describe("AssignmentList", () => {
  it("harus menampilkan pesan kosong jika tidak ada assignment", () => {
    render(<AssignmentList assignments={[]} />);
    expect(screen.getByText(/belum ada instrumen yang ditugaskan/i)).toBeInTheDocument();
  });

  it("harus merender daftar assignment dengan benar", () => {
    render(<AssignmentList assignments={mockAssignments} />);
    // instrument_id.slice(0, 8): "inst-abcdefgh" → "inst-abc"
    expect(screen.getByText(/Instrumen #inst-abc/)).toBeInTheDocument();
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
