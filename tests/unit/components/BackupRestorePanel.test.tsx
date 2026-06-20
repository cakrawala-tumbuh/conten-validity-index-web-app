/**
 * Unit test untuk komponen BackupRestorePanel.
 *
 * Menguji rendering seksi backup & restore, alur unduh backup, validasi berkas,
 * dan alur restore dengan konfirmasi.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BackupRestorePanel } from "@/components/features/backup/BackupRestorePanel";

const mockFetch = jest.fn();
global.fetch = mockFetch;

global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = jest.fn();

/**
 * Membuat berkas backup palsu dengan method `text()` yang dipaksa.
 *
 * @param content - Isi teks berkas.
 * @returns Objek File dengan `text()` yang mengembalikan `content`.
 */
function makeFile(content: string): File {
  const file = new File([content], "backup.json", { type: "application/json" });
  file.text = jest.fn().mockResolvedValue(content) as unknown as File["text"];
  return file;
}

const validBackup = {
  version: "1.0",
  created_at: "2026-06-12T08:30:00",
  tables: { users: [{ id: "u1" }], instruments: [] },
};

describe("BackupRestorePanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("harus merender seksi unduh dan pulihkan", () => {
    render(<BackupRestorePanel />);
    expect(screen.getByRole("button", { name: /unduh backup/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pulihkan database/i })).toBeInTheDocument();
  });

  it("harus menonaktifkan tombol pulihkan sebelum berkas dipilih", () => {
    render(<BackupRestorePanel />);
    expect(screen.getByRole("button", { name: /pulihkan database/i })).toBeDisabled();
  });

  it("harus memanggil endpoint backup dan memicu unduhan saat tombol unduh diklik", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(["{}"], { type: "application/json" }),
      json: async () => ({}),
    });
    // Spy klik anchor membuktikan mekanisme unduhan benar-benar terpicu —
    // bukan sekadar memanggil fetch tanpa hasil (regresi "tidak terjadi apa-apa").
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<BackupRestorePanel />);
    fireEvent.click(screen.getByRole("button", { name: /unduh backup/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/backup");
    });
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("harus menampilkan error saat unduh backup gagal", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ detail: "Akses ditolak." }),
    });
    render(<BackupRestorePanel />);
    fireEvent.click(screen.getByRole("button", { name: /unduh backup/i }));
    await waitFor(() => {
      expect(screen.getByText("Akses ditolak.")).toBeInTheDocument();
    });
  });

  it("harus memulihkan database setelah berkas valid dipilih dan dikonfirmasi", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: "Restore database berhasil.",
        tables_restored: { users: 1 },
        total_rows: 1,
      }),
    });
    const { container } = render(<BackupRestorePanel />);

    const input = container.querySelector("#backup-file") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile(JSON.stringify(validBackup))] } });

    const checkbox = await screen.findByRole("checkbox");
    fireEvent.click(checkbox);

    fireEvent.click(screen.getByRole("button", { name: /pulihkan database/i }));

    await waitFor(() => {
      expect(screen.getByText(/restore database berhasil/i)).toBeInTheDocument();
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/backup/restore",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("harus menampilkan error saat berkas bukan JSON valid", async () => {
    const { container } = render(<BackupRestorePanel />);
    const input = container.querySelector("#backup-file") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile("bukan json")] } });

    const checkbox = await screen.findByRole("checkbox");
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole("button", { name: /pulihkan database/i }));

    await waitFor(() => {
      expect(screen.getByText(/bukan json yang valid/i)).toBeInTheDocument();
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("harus menampilkan error saat struktur backup tidak valid", async () => {
    const { container } = render(<BackupRestorePanel />);
    const input = container.querySelector("#backup-file") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile(JSON.stringify({ foo: "bar" }))] } });

    const checkbox = await screen.findByRole("checkbox");
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole("button", { name: /pulihkan database/i }));

    await waitFor(() => {
      expect(screen.getByText(/struktur berkas backup tidak valid/i)).toBeInTheDocument();
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
