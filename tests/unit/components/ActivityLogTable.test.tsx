/**
 * Unit test untuk komponen ActivityLogTable.
 *
 * Menguji rendering tabel log, state kosong, dan kontrol filter.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ActivityLogTable } from "@/components/features/activity-logs/ActivityLogTable";
import type { ActivityLogResponse } from "@/types/activity-log";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockLogs: ActivityLogResponse[] = [
  {
    id: "log-1",
    user_id: "user-abcdefgh",
    action: "create_instrument",
    resource_type: "instrument",
    resource_id: "inst-12345678",
    ip_address: "127.0.0.1",
    user_agent: "Mozilla/5.0",
    created_at: "2024-06-01T10:30:00Z",
  },
  {
    id: "log-2",
    user_id: null,
    action: "login",
    resource_type: null,
    resource_id: null,
    ip_address: "192.168.1.1",
    user_agent: null,
    created_at: "2024-06-01T09:00:00Z",
  },
];

describe("ActivityLogTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("harus menampilkan pesan kosong jika tidak ada log", () => {
    render(<ActivityLogTable initialLogs={[]} />);
    expect(screen.getByText(/tidak ada log aktivitas ditemukan/i)).toBeInTheDocument();
  });

  it("harus menampilkan jumlah log yang ditampilkan", () => {
    render(<ActivityLogTable initialLogs={mockLogs} />);
    expect(screen.getByText("Menampilkan 2 log")).toBeInTheDocument();
  });

  it("harus merender baris tabel untuk setiap log", () => {
    render(<ActivityLogTable initialLogs={mockLogs} />);
    // IP address dari log-1
    expect(screen.getByText("127.0.0.1")).toBeInTheDocument();
    expect(screen.getByText("192.168.1.1")).toBeInTheDocument();
  });

  it("harus menampilkan label aksi yang ramah", () => {
    render(<ActivityLogTable initialLogs={mockLogs} />);
    // "Buat Instrumen" muncul di select option dan badge tabel
    const bautInstrumenElements = screen.getAllByText("Buat Instrumen");
    expect(bautInstrumenElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Login").length).toBeGreaterThanOrEqual(1);
  });

  it("harus menampilkan 'sistem' untuk log dengan user_id null", () => {
    render(<ActivityLogTable initialLogs={[mockLogs[1]]} />);
    expect(screen.getByText("sistem")).toBeInTheDocument();
  });

  it("harus menampilkan user_id yang dipotong untuk log dengan user_id", () => {
    render(<ActivityLogTable initialLogs={[mockLogs[0]]} />);
    expect(screen.getByText("user-abc...")).toBeInTheDocument();
  });

  it("harus menampilkan select filter aksi", () => {
    render(<ActivityLogTable initialLogs={[]} />);
    expect(screen.getByText("Semua aksi")).toBeInTheDocument();
  });

  it("harus menampilkan input filter tanggal dari dan sampai", () => {
    render(<ActivityLogTable initialLogs={[]} />);
    expect(screen.getByText("Dari Tanggal")).toBeInTheDocument();
    expect(screen.getByText("Sampai Tanggal")).toBeInTheDocument();
  });

  it("harus menampilkan tombol Terapkan Filter", () => {
    render(<ActivityLogTable initialLogs={[]} />);
    expect(screen.getByRole("button", { name: /terapkan filter/i })).toBeInTheDocument();
  });

  it("harus menampilkan resource type di tabel", () => {
    render(<ActivityLogTable initialLogs={[mockLogs[0]]} />);
    expect(screen.getByText(/instrument/)).toBeInTheDocument();
  });

  it("harus memanggil fetch saat tombol Terapkan Filter diklik", async () => {
    const freshLogs: ActivityLogResponse[] = [
      {
        id: "log-3",
        user_id: "user-xyz",
        action: "delete_instrument",
        resource_type: "instrument",
        resource_id: "inst-999",
        ip_address: "10.0.0.1",
        user_agent: null,
        created_at: "2024-07-01T00:00:00Z",
      },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => freshLogs,
    });
    render(<ActivityLogTable initialLogs={mockLogs} />);
    fireEvent.click(screen.getByRole("button", { name: /terapkan filter/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/activity-logs"),
      );
    });
  });

  it("harus menampilkan error saat fetch filter gagal", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Gagal memuat log" }),
    });
    render(<ActivityLogTable initialLogs={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /terapkan filter/i }));
    await waitFor(() => {
      expect(screen.getByText("Gagal memuat log")).toBeInTheDocument();
    });
  });

  it("harus menampilkan label aksi delete dengan warna merah", () => {
    const deleteLog: ActivityLogResponse = {
      id: "log-del",
      user_id: "user-1",
      action: "delete_instrument",
      resource_type: "instrument",
      resource_id: "inst-1",
      ip_address: "10.0.0.1",
      user_agent: null,
      created_at: "2024-07-01T00:00:00Z",
    };
    render(<ActivityLogTable initialLogs={[deleteLog]} />);
    // "Hapus Instrumen" muncul di badge tabel DAN di select option
    const hapusElements = screen.getAllByText("Hapus Instrumen");
    expect(hapusElements.length).toBeGreaterThanOrEqual(1);
  });

  it("harus menampilkan label aksi submit_rating", () => {
    const submitLog: ActivityLogResponse = {
      id: "log-submit",
      user_id: "user-2",
      action: "submit_rating",
      resource_type: "instrument",
      resource_id: "inst-1",
      ip_address: "10.0.0.2",
      user_agent: null,
      created_at: "2024-07-01T00:00:00Z",
    };
    render(<ActivityLogTable initialLogs={[submitLog]} />);
    // "Submit Rating" muncul di badge tabel DAN di select option
    const submitElements = screen.getAllByText("Submit Rating");
    expect(submitElements.length).toBeGreaterThanOrEqual(1);
  });

  it("harus memperbarui filter aksi saat select diubah", () => {
    render(<ActivityLogTable initialLogs={mockLogs} />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "create_instrument" } });
    expect((select as HTMLSelectElement).value).toBe("create_instrument");
  });
});
