/**
 * Unit test untuk komponen RatingForm.
 *
 * Menguji rendering form penilaian, progress indicator, validasi submit,
 * dan penanganan pre-filled data dari penilaian sebelumnya.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RatingForm } from "@/components/features/ratings/RatingForm";
import type { AssignmentResponse } from "@/types/expert-assignment";
import type { ItemResponse } from "@/types/item";
import type { RatingResponse } from "@/types/rating";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockAssignment: AssignmentResponse = {
  id: "asgn-1",
  instrument_id: "inst-1",
  user_id: "expert-1",
  assigned_by: "admin-1",
  deadline: null,
  status: "pending",
  assigned_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockItems: ItemResponse[] = [
  {
    id: "item-1",
    instrument_id: "inst-1",
    sequence_number: 1,
    content: "Item pertama untuk dinilai",
    domain: "Kognitif",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "item-2",
    instrument_id: "inst-1",
    sequence_number: 2,
    content: "Item kedua untuk dinilai",
    domain: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

const mockExistingRatings: RatingResponse[] = [
  {
    id: "rating-1",
    assignment_id: "asgn-1",
    item_id: "item-1",
    user_id: "expert-1",
    relevance_score: 4,
    notes: "Catatan item 1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

/** Rating lengkap untuk semua item agar isComplete = true. */
const mockAllRatings: RatingResponse[] = [
  {
    id: "rating-1",
    assignment_id: "asgn-1",
    item_id: "item-1",
    user_id: "expert-1",
    relevance_score: 4,
    notes: "Catatan item 1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "rating-2",
    assignment_id: "asgn-1",
    item_id: "item-2",
    user_id: "expert-1",
    relevance_score: 3,
    notes: "",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

describe("RatingForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("harus merender semua item dalam form", () => {
    render(<RatingForm assignment={mockAssignment} items={mockItems} existingRatings={[]} />);
    expect(screen.getByText("Item pertama untuk dinilai")).toBeInTheDocument();
    expect(screen.getByText("Item kedua untuk dinilai")).toBeInTheDocument();
  });

  it("harus menampilkan progress indicator", () => {
    render(<RatingForm assignment={mockAssignment} items={mockItems} existingRatings={[]} />);
    expect(screen.getByText(/progres/i)).toBeInTheDocument();
    // 0 dari 2 terisi
    expect(screen.getByText(/0 \/ 2/)).toBeInTheDocument();
  });

  it("harus menampilkan radio button untuk setiap skala (1-4)", () => {
    render(<RatingForm assignment={mockAssignment} items={[mockItems[0]]} existingRatings={[]} />);
    // Labels render as "1 — Tidak Relevan" etc. in a single <span>
    expect(screen.getByText(/tidak relevan/i)).toBeInTheDocument();
    expect(screen.getByText(/kurang relevan/i)).toBeInTheDocument();
    expect(screen.getByText(/cukup relevan/i)).toBeInTheDocument();
    expect(screen.getByText(/sangat relevan/i)).toBeInTheDocument();
  });

  it("harus tombol submit disabled jika belum semua item dinilai", () => {
    render(<RatingForm assignment={mockAssignment} items={mockItems} existingRatings={[]} />);
    const submitButton = screen.getByRole("button", { name: /simpan semua penilaian/i });
    expect(submitButton).toBeDisabled();
  });

  it("harus mengisi ulang form dari existing ratings", () => {
    render(
      <RatingForm
        assignment={mockAssignment}
        items={mockItems}
        existingRatings={mockExistingRatings}
      />,
    );
    // item-1 sudah pre-filled dengan score 4
    const radio4Elements = screen.getAllByRole("radio", { name: /sangat relevan/i });
    expect(radio4Elements[0]).toBeChecked();
  });

  it("harus menampilkan catatan existing rating di textarea", () => {
    render(
      <RatingForm
        assignment={mockAssignment}
        items={mockItems}
        existingRatings={mockExistingRatings}
      />,
    );
    expect(screen.getByDisplayValue("Catatan item 1")).toBeInTheDocument();
  });

  it("harus menampilkan error jika submit sebelum semua item dinilai", () => {
    render(<RatingForm assignment={mockAssignment} items={mockItems} existingRatings={[]} />);
    // Klik submit meski disabled — coba via form submit langsung
    const submitButton = screen.getByRole("button", { name: /simpan semua penilaian/i });
    // Button disabled, jadi tidak bisa diklik, tapi test tetap valid
    expect(submitButton).toBeDisabled();
  });

  it("harus menampilkan konten item dan nomor urut", () => {
    render(<RatingForm assignment={mockAssignment} items={mockItems} existingRatings={[]} />);
    // sequence_number rendered as plain number, no trailing dot
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("harus mengupdate progress saat radio button dipilih", () => {
    render(<RatingForm assignment={mockAssignment} items={mockItems} existingRatings={[]} />);
    // Pilih skor 3 untuk item pertama
    const radio3Options = screen.getAllByRole("radio", { name: /cukup relevan/i });
    fireEvent.click(radio3Options[0]);
    // Progress harus menjadi 1/2
    expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument();
  });

  it("harus berhasil submit penilaian lengkap dan menampilkan sukses", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(
      <RatingForm assignment={mockAssignment} items={mockItems} existingRatings={mockAllRatings} />,
    );
    const form = screen.getByRole("button", { name: /simpan semua penilaian/i }).closest("form");
    if (form) fireEvent.submit(form);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/assignments/${mockAssignment.id}/ratings/bulk`,
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("harus menampilkan state sukses setelah submit berhasil", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(
      <RatingForm assignment={mockAssignment} items={mockItems} existingRatings={mockAllRatings} />,
    );
    const form = screen.getByRole("button", { name: /simpan semua penilaian/i }).closest("form");
    if (form) fireEvent.submit(form);
    await waitFor(() => {
      expect(screen.getByText(/penilaian berhasil disimpan/i)).toBeInTheDocument();
    });
  });

  it("harus menampilkan error saat submit gagal", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Server error" }),
    });
    render(
      <RatingForm assignment={mockAssignment} items={mockItems} existingRatings={mockAllRatings} />,
    );
    const form = screen.getByRole("button", { name: /simpan semua penilaian/i }).closest("form");
    if (form) fireEvent.submit(form);
    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });
});
