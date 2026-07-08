/**
 * Unit test untuk komponen ExpertRatingsSection.
 *
 * Menguji rendering awal, loading state, error state, tampilan data,
 * keadaan tanpa expert, dan interaksi accordion per expert.
 */
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { ExpertRatingsSection } from "@/components/features/instruments/ExpertRatingsSection";
import type { InstrumentExpertRatingsResponse } from "@/types/cvi";

const mockFetch = jest.fn();
global.fetch = mockFetch;
global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = jest.fn();

/** Fixture data satu expert dengan dua item. */
const makeResponse = (
  overrides: Partial<InstrumentExpertRatingsResponse> = {},
): InstrumentExpertRatingsResponse => ({
  instrument_id: "inst-1",
  instrument_name: "Instrumen A",
  n_items: 2,
  n_experts: 1,
  experts: [
    {
      assignment_id: "assign-1",
      user_id: "user-1",
      expert_name: "Dr. Budi",
      institution: "Universitas X",
      status: "completed",
      deadline: null,
      is_active: true,
      ratings: [
        {
          item_id: "item-1",
          sequence_number: 1,
          content: "Konten item satu",
          domain_id: null,
          domain_name: "Dimensi Kognitif",
          relevance_score: 4,
          notes: "Sangat bagus",
          is_relevant: true,
        },
        {
          item_id: "item-2",
          sequence_number: 2,
          content: "Konten item dua",
          domain_id: null,
          domain_name: null,
          relevance_score: null,
          notes: null,
          is_relevant: null,
        },
      ],
    },
  ],
  ...overrides,
});

describe("ExpertRatingsSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("harus menampilkan tombol Tampilkan Penilaian di awal", () => {
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    expect(screen.getByRole("button", { name: /tampilkan penilaian/i })).toBeInTheDocument();
  });

  it("harus menampilkan placeholder sebelum data dimuat", () => {
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    expect(screen.getByText(/klik.*tampilkan penilaian/i)).toBeInTheDocument();
  });

  it("harus menampilkan loading state saat fetch berjalan", async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    expect(await screen.findByText(/memuat\.\.\./i)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("harus menampilkan pesan error jika fetch gagal dengan detail", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Instrumen tidak ditemukan" }),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByText(/instrumen tidak ditemukan/i)).toBeInTheDocument();
    });
  });

  it("harus menampilkan pesan error default jika fetch gagal tanpa detail", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByText(/gagal memuat penilaian/i)).toBeInTheDocument();
    });
  });

  it("harus menampilkan pesan error jika fetch melempar exception", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it("harus menampilkan informasi jumlah expert dan item setelah data dimuat", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByText(/1 expert/i)).toBeInTheDocument();
      expect(screen.getByText(/2 item/i)).toBeInTheDocument();
    });
  });

  it("harus mengganti label tombol menjadi Muat Ulang setelah data berhasil dimuat", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /muat ulang/i })).toBeInTheDocument();
    });
  });

  it("harus menampilkan pesan kosong jika tidak ada expert", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse({ experts: [], n_experts: 0 }),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByText(/belum ada expert yang di-assign/i)).toBeInTheDocument();
    });
  });

  it("harus menampilkan kartu expert pertama dalam keadaan terbuka secara default", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByText("Konten item satu")).toBeInTheDocument();
    });
  });

  it("harus menampilkan nama dan institusi expert", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByText("Dr. Budi")).toBeInTheDocument();
      expect(screen.getByText("Universitas X")).toBeInTheDocument();
    });
  });

  it("harus tidak menampilkan baris institusi jika institution null", async () => {
    const noInstitution = makeResponse();
    noInstitution.experts[0].institution = null;
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => noInstitution });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByText("Dr. Budi")).toBeInTheDocument();
    });
    expect(screen.queryByText("Universitas X")).not.toBeInTheDocument();
  });

  it("harus menampilkan skor relevansi item yang sudah dinilai", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByText(/4 — sangat relevan/i)).toBeInTheDocument();
    });
  });

  it("harus menampilkan teks Belum dinilai untuk item yang belum dinilai", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByText(/belum dinilai/i)).toBeInTheDocument();
    });
  });

  it("harus menampilkan catatan item jika ada", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByText("Sangat bagus")).toBeInTheDocument();
    });
  });

  it("harus menyembunyikan dan membuka tabel penilaian saat header accordion diklik", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByText("Konten item satu")).toBeInTheDocument();
    });
    // Klik header expert card untuk menutup accordion
    fireEvent.click(screen.getByText("Dr. Budi").closest('[role="button"]')!);
    expect(screen.queryByText("Konten item satu")).not.toBeInTheDocument();
    // Klik lagi untuk membuka
    fireEvent.click(screen.getByText("Dr. Budi").closest('[role="button"]')!);
    expect(screen.getByText("Konten item satu")).toBeInTheDocument();
  });

  it("harus menampilkan badge status yang benar untuk setiap status", async () => {
    const responses = [
      { status: "pending", label: "Belum Mulai" },
      { status: "in_progress", label: "Sedang Berjalan" },
      { status: "completed", label: "Selesai" },
    ];
    for (const { status, label } of responses) {
      jest.clearAllMocks();
      const resp = makeResponse();
      resp.experts[0].status = status;
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => resp });
      const { unmount } = render(<ExpertRatingsSection instrumentId="inst-1" />);
      fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
      await waitFor(() => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
      unmount();
    }
  });

  it("harus menampilkan status mentah jika tidak dikenali", async () => {
    const resp = makeResponse();
    resp.experts[0].status = "unknown_status";
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => resp });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByText("unknown_status")).toBeInTheDocument();
    });
  });

  it("harus menampilkan ringkasan jumlah penilaian dan relevan di header expert", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      // 1 dari 2 item dinilai, 1 relevan
      expect(screen.getByText(/1\/2 dinilai/i)).toBeInTheDocument();
      expect(screen.getByText(/1 relevan/i)).toBeInTheDocument();
    });
  });

  it("kartu expert kedua harus dimulai dalam keadaan tertutup", async () => {
    const resp = makeResponse({ n_experts: 2 });
    resp.experts.push({
      assignment_id: "assign-2",
      user_id: "user-2",
      expert_name: "Prof. Ani",
      institution: null,
      status: "pending",
      deadline: null,
      is_active: true,
      ratings: [
        {
          item_id: "item-1",
          sequence_number: 1,
          content: "Konten item satu",
          domain_id: null,
          domain_name: null,
          relevance_score: 3,
          notes: null,
          is_relevant: true,
        },
      ],
    });
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => resp });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByText("Prof. Ani")).toBeInTheDocument();
    });
    // Kartu kedua (Prof. Ani) tertutup — tabel konten hanya tampil satu kali
    // (dari kartu pertama Dr. Budi yang terbuka)
    const contentCells = screen.getAllByText("Konten item satu");
    expect(contentCells).toHaveLength(1);
  });

  it("harus menampilkan kolom Domain dengan nama domain atau tanda '-'", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByText("Dimensi Kognitif")).toBeInTheDocument();
    });
    const card = screen.getByTestId("expert-card-assign-1");
    expect(within(card).getByText("-")).toBeInTheDocument();
  });

  it("harus menampilkan tombol Export Excel dan PDF di setiap kartu expert", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByTestId("expert-card-assign-1")).toBeInTheDocument();
    });
    const card = screen.getByTestId("expert-card-assign-1");
    expect(within(card).getByRole("button", { name: /export excel/i })).toBeInTheDocument();
    expect(within(card).getByRole("button", { name: /export pdf/i })).toBeInTheDocument();
  });

  it("harus memanggil endpoint export Excel milik assignment yang benar saat tombol diklik", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByTestId("expert-card-assign-1")).toBeInTheDocument();
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(["data"], { type: "application/vnd.ms-excel" }),
    });
    const card = screen.getByTestId("expert-card-assign-1");
    fireEvent.click(within(card).getByRole("button", { name: /export excel/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/instruments/inst-1/assignments/assign-1/export"),
      );
    });
    const calledUrl = mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0] as string;
    expect(calledUrl).not.toContain("/export/pdf");
  });

  it("harus memanggil endpoint export PDF milik assignment yang benar saat tombol diklik", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByTestId("expert-card-assign-1")).toBeInTheDocument();
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(["data"], { type: "application/pdf" }),
    });
    const card = screen.getByTestId("expert-card-assign-1");
    fireEvent.click(within(card).getByRole("button", { name: /export pdf/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/instruments/inst-1/assignments/assign-1/export/pdf"),
      );
    });
  });

  it("klik tombol export tidak boleh menutup/membuka accordion", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByText("Konten item satu")).toBeInTheDocument();
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(["data"]),
    });
    const card = screen.getByTestId("expert-card-assign-1");
    fireEvent.click(within(card).getByRole("button", { name: /export excel/i }));

    // Accordion (kartu pertama, defaultOpen) tetap terbuka setelah klik export
    expect(screen.getByText("Konten item satu")).toBeInTheDocument();
  });

  it("harus menampilkan pesan error jika export gagal", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByTestId("expert-card-assign-1")).toBeInTheDocument();
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Gagal mengekspor penilaian expert" }),
    });
    const card = screen.getByTestId("expert-card-assign-1");
    fireEvent.click(within(card).getByRole("button", { name: /export excel/i }));

    await waitFor(() => {
      expect(within(card).getByText(/gagal mengekspor penilaian expert/i)).toBeInTheDocument();
    });
  });

  it("harus menampilkan pesan error jika export PDF gagal", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByTestId("expert-card-assign-1")).toBeInTheDocument();
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Gagal mengekspor PDF penilaian expert" }),
    });
    const card = screen.getByTestId("expert-card-assign-1");
    fireEvent.click(within(card).getByRole("button", { name: /export pdf/i }));

    await waitFor(() => {
      expect(within(card).getByText(/gagal mengekspor pdf penilaian expert/i)).toBeInTheDocument();
    });
  });

  it("harus membuka/menutup accordion dengan tombol keyboard Enter/Space pada header", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeResponse(),
    });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByText("Konten item satu")).toBeInTheDocument();
    });

    const header = screen.getByText("Dr. Budi").closest('[role="button"]')!;
    fireEvent.keyDown(header, { key: "Enter" });
    expect(screen.queryByText("Konten item satu")).not.toBeInTheDocument();

    fireEvent.keyDown(header, { key: " " });
    expect(screen.getByText("Konten item satu")).toBeInTheDocument();

    // Tombol lain (mis. Escape) tidak boleh memicu toggle.
    fireEvent.keyDown(header, { key: "Escape" });
    expect(screen.getByText("Konten item satu")).toBeInTheDocument();
  });

  it("tombol export pada kartu kedua yang tertutup tetap dapat diklik secara independen", async () => {
    const resp = makeResponse({ n_experts: 2 });
    resp.experts.push({
      assignment_id: "assign-2",
      user_id: "user-2",
      expert_name: "Prof. Ani",
      institution: null,
      status: "pending",
      deadline: null,
      is_active: true,
      ratings: [
        {
          item_id: "item-1",
          sequence_number: 1,
          content: "Konten item satu",
          domain_id: null,
          domain_name: null,
          relevance_score: 3,
          notes: null,
          is_relevant: true,
        },
      ],
    });
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => resp });
    render(<ExpertRatingsSection instrumentId="inst-1" />);
    fireEvent.click(screen.getByRole("button", { name: /tampilkan penilaian/i }));
    await waitFor(() => {
      expect(screen.getByTestId("expert-card-assign-2")).toBeInTheDocument();
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(["data"]),
    });
    const card2 = screen.getByTestId("expert-card-assign-2");
    fireEvent.click(within(card2).getByRole("button", { name: /export excel/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/instruments/inst-1/assignments/assign-2/export"),
      );
    });
  });
});
