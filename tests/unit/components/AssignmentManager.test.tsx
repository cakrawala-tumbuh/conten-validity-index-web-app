/**
 * Unit test untuk komponen AssignmentManager.
 *
 * Menguji rendering daftar assignment, tampilan state kosong,
 * dan interaksi tombol tambah/hapus assignment.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AssignmentManager } from "@/components/features/instruments/AssignmentManager";
import type { AssignmentResponse } from "@/types/expert-assignment";
import type { UserResponse } from "@/types/user";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockConfirm = jest.fn();
global.confirm = mockConfirm;

const mockAssignments: AssignmentResponse[] = [
  {
    id: "asgn-1",
    instrument_id: "inst-1",
    instrument_name: "Skala Motivasi Belajar",
    user_id: "expert-1",
    assigned_by: "admin-1",
    deadline: "2025-12-31",
    status: "pending",
    assigned_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    previous_assignment_id: null,
    revision_number: 1,
  },
];

const mockExperts: UserResponse[] = [
  {
    id: "expert-1",
    email: "expert1@example.com",
    full_name: "Dr. Expert Satu",
    institution: "Univ A",
    expertise_areas: [],
    role: "expert",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "expert-2",
    email: "expert2@example.com",
    full_name: "Dr. Expert Dua",
    institution: "Univ B",
    expertise_areas: [],
    role: "expert",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

describe("AssignmentManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("harus menampilkan pesan kosong jika tidak ada assignment", () => {
    render(
      <AssignmentManager instrumentId="inst-1" initialAssignments={[]} availableExperts={[]} />,
    );
    expect(screen.getByText(/belum ada expert yang ditugaskan/i)).toBeInTheDocument();
  });

  it("harus merender daftar assignment dengan nama expert", () => {
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={mockAssignments}
        availableExperts={mockExperts}
      />,
    );
    expect(screen.getByText("Dr. Expert Satu")).toBeInTheDocument();
  });

  it("harus menampilkan status badge assignment", () => {
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={mockAssignments}
        availableExperts={mockExperts}
      />,
    );
    expect(screen.getByText("Menunggu")).toBeInTheDocument();
  });

  it("harus menampilkan institusi expert", () => {
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={mockAssignments}
        availableExperts={mockExperts}
      />,
    );
    expect(screen.getByText("Univ A")).toBeInTheDocument();
  });

  it("harus menampilkan tombol Tugaskan Expert", () => {
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={[]}
        availableExperts={mockExperts}
      />,
    );
    expect(screen.getByRole("button", { name: /tugaskan expert/i })).toBeInTheDocument();
  });

  it("harus menampilkan form setelah klik tombol Tugaskan Expert", () => {
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={[]}
        availableExperts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /tugaskan expert/i }));
    expect(screen.getByRole("button", { name: /tugaskan/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /batal/i })).toBeInTheDocument();
  });

  it("harus menyembunyikan expert yang sudah di-assign dari dropdown", () => {
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={mockAssignments}
        availableExperts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /tugaskan expert/i }));
    // expert-1 sudah di-assign, tidak muncul di dropdown
    const options = screen.queryAllByRole("option");
    const expertOneOption = options.find((o) => o.textContent?.includes("Dr. Expert Satu"));
    expect(expertOneOption).toBeUndefined();
  });

  it("harus menampilkan konfirmasi sebelum menghapus assignment", () => {
    mockConfirm.mockReturnValue(false);
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={mockAssignments}
        availableExperts={mockExperts}
      />,
    );
    const deleteButton = screen.getByTitle("Hapus assignment");
    fireEvent.click(deleteButton);
    expect(mockConfirm).toHaveBeenCalled();
  });

  it("harus berhasil menugaskan expert baru", async () => {
    const newAssignment = {
      id: "assign-2",
      instrument_id: "inst-1",
      user_id: "expert-2",
      status: "pending",
      deadline: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newAssignment,
    });
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={[]}
        availableExperts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /tugaskan expert/i }));
    // Pilih expert dari dropdown
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "expert-1" } });
    fireEvent.click(screen.getByRole("button", { name: /^tugaskan$/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/instruments/inst-1/assignments",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("harus menampilkan error jika tidak ada expert dipilih saat tugaskan", () => {
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={[]}
        availableExperts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /tugaskan expert/i }));
    fireEvent.click(screen.getByRole("button", { name: /^tugaskan$/i }));
    expect(screen.getByText(/pilih expert terlebih dahulu/i)).toBeInTheDocument();
  });

  it("harus menghapus assignment setelah konfirmasi diterima", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={mockAssignments}
        availableExperts={mockExperts}
      />,
    );
    const deleteButton = screen.getByTitle("Hapus assignment");
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/instruments/inst-1/assignments/`),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  it("harus menampilkan error saat penghapusan assignment gagal", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Assignment tidak ditemukan" }),
    });
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={mockAssignments}
        availableExperts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByTitle("Hapus assignment"));
    await waitFor(() => {
      expect(screen.getByText("Assignment tidak ditemukan")).toBeInTheDocument();
    });
  });

  it("harus menampilkan error saat penugasan expert gagal dari server", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Expert sudah ditugaskan" }),
    });
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={[]}
        availableExperts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /tugaskan expert/i }));
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "expert-1" } });
    fireEvent.click(screen.getByRole("button", { name: /^tugaskan$/i }));
    await waitFor(() => {
      expect(screen.getByText("Expert sudah ditugaskan")).toBeInTheDocument();
    });
  });

  it("harus mengizinkan mengisi tenggat pada form penugasan", () => {
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={[]}
        availableExperts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /tugaskan expert/i }));
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: "2025-12-31" } });
      expect(dateInput.value).toBe("2025-12-31");
    }
  });

  it("harus menutup form saat tombol Batal diklik", () => {
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={[]}
        availableExperts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /tugaskan expert/i }));
    expect(screen.getByRole("button", { name: /^tugaskan$/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^batal$/i }));
    expect(screen.queryByRole("button", { name: /^tugaskan$/i })).not.toBeInTheDocument();
  });

  it("harus menampilkan deadline yang sudah diformat di tabel", () => {
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={mockAssignments}
        availableExperts={mockExperts}
      />,
    );
    // deadline: "2025-12-31" harus ditampilkan dalam format lokal
    expect(screen.getByText(/des.*2025|31.*2025|2025/i)).toBeInTheDocument();
  });

  it("harus menampilkan tombol Arsipkan untuk assignment yang tidak archived", () => {
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={mockAssignments}
        availableExperts={mockExperts}
      />,
    );
    expect(screen.getByTitle("Arsipkan & buat revisi baru")).toBeInTheDocument();
  });

  it("harus tidak menampilkan tombol Arsipkan untuk assignment berstatus archived", () => {
    const archivedAssignments: AssignmentResponse[] = [
      {
        ...mockAssignments[0],
        id: "asgn-archived",
        status: "archived",
      },
    ];
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={archivedAssignments}
        availableExperts={mockExperts}
      />,
    );
    expect(screen.queryByTitle("Arsipkan & buat revisi baru")).not.toBeInTheDocument();
  });

  it("harus menampilkan label Diarsipkan untuk status archived", () => {
    const archivedAssignments: AssignmentResponse[] = [
      {
        ...mockAssignments[0],
        id: "asgn-archived",
        status: "archived",
      },
    ];
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={archivedAssignments}
        availableExperts={mockExperts}
      />,
    );
    expect(screen.getByText("Diarsipkan")).toBeInTheDocument();
  });

  it("harus menampilkan konfirmasi sebelum mengarsipkan assignment", () => {
    mockConfirm.mockReturnValue(false);
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={mockAssignments}
        availableExperts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByTitle("Arsipkan & buat revisi baru"));
    expect(mockConfirm).toHaveBeenCalled();
  });

  it("harus berhasil mengarsipkan dan membuat revisi baru", async () => {
    mockConfirm.mockReturnValue(true);
    const revisionResult = {
      archived_assignment: {
        ...mockAssignments[0],
        status: "archived",
      },
      new_assignment: {
        ...mockAssignments[0],
        id: "asgn-2",
        status: "in_progress",
        previous_assignment_id: "asgn-1",
        revision_number: 2,
      },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => revisionResult,
    });
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={mockAssignments}
        availableExperts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByTitle("Arsipkan & buat revisi baru"));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/instruments/inst-1/assignments/asgn-1/revise",
        expect.objectContaining({ method: "POST" }),
      );
    });
    await waitFor(() => {
      expect(screen.getByText("Diarsipkan")).toBeInTheDocument();
      expect(screen.getByText("Sedang Berjalan")).toBeInTheDocument();
    });
  });

  it("harus menampilkan error jika arsip assignment gagal", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Assignment sudah diarsipkan" }),
    });
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={mockAssignments}
        availableExperts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByTitle("Arsipkan & buat revisi baru"));
    await waitFor(() => {
      expect(screen.getByText("Assignment sudah diarsipkan")).toBeInTheDocument();
    });
  });

  it("harus menampilkan expert archived di dropdown karena sudah tidak aktif", () => {
    const archivedAssignment: AssignmentResponse = {
      ...mockAssignments[0],
      status: "archived",
    };
    render(
      <AssignmentManager
        instrumentId="inst-1"
        initialAssignments={[archivedAssignment]}
        availableExperts={mockExperts}
      />,
    );
    // Karena assignment archived, expert-1 seharusnya muncul kembali di dropdown
    fireEvent.click(screen.getByRole("button", { name: /tugaskan expert/i }));
    const options = screen.queryAllByRole("option");
    const expertOneOption = options.find((o) => o.textContent?.includes("Dr. Expert Satu"));
    expect(expertOneOption).toBeDefined();
  });
});
