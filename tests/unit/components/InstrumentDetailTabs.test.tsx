/**
 * Unit test untuk komponen InstrumentDetailTabs.
 *
 * Menguji rendering tab default, navigasi antar tab, dan tampilan konten
 * masing-masing tab.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InstrumentDetailTabs } from "@/components/features/instruments/InstrumentDetailTabs";
import type { InstrumentResponse } from "@/types/instrument";
import type { ItemResponse } from "@/types/item";
import type { DomainResponse } from "@/types/domain";
import type { AssignmentResponse } from "@/types/expert-assignment";
import type { UserResponse } from "@/types/user";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockConfirm = jest.fn();
global.confirm = mockConfirm;

const mockInstrument: InstrumentResponse = {
  id: "inst-1",
  name: "Instrumen Uji Keperawatan",
  description: "Deskripsi instrumen",
  version: "1.0",
  status: "draft",
  created_by: "admin-1",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockItems: ItemResponse[] = [
  {
    id: "item-1",
    instrument_id: "inst-1",
    sequence_number: 1,
    content: "Konten item satu",
    domain_id: "dom-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

const mockDomains: DomainResponse[] = [
  {
    id: "dom-1",
    instrument_id: "inst-1",
    name: "Kognitif",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dom-2",
    instrument_id: "inst-1",
    name: "Afektif",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

const mockAssignments: AssignmentResponse[] = [
  {
    id: "asgn-1",
    instrument_id: "inst-1",
    user_id: "expert-1",
    assigned_by: "admin-1",
    deadline: null,
    status: "pending",
    assigned_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

const mockExperts: UserResponse[] = [
  {
    id: "expert-1",
    email: "e@example.com",
    full_name: "Expert Satu",
    institution: "Univ A",
    expertise_area: null,
    role: "expert",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

describe("InstrumentDetailTabs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("harus merender dengan tab Informasi aktif secara default", () => {
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    // Tab Informasi harus ada
    expect(screen.getByRole("button", { name: /informasi/i })).toBeInTheDocument();
  });

  it("harus menampilkan nama instrumen di tab Informasi", () => {
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    expect(screen.getByDisplayValue("Instrumen Uji Keperawatan")).toBeInTheDocument();
  });

  it("harus menampilkan jumlah item di label tab Item", () => {
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    expect(screen.getByText(`Item (${mockItems.length})`)).toBeInTheDocument();
  });

  it("harus menampilkan jumlah assignment di label tab Expert", () => {
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    expect(screen.getByText(`Expert (${mockAssignments.length})`)).toBeInTheDocument();
  });

  it("harus berpindah ke tab Item saat diklik", () => {
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByText(`Item (${mockItems.length})`));
    // ItemsManager merender item
    expect(screen.getByText("Konten item satu")).toBeInTheDocument();
  });

  it("harus berpindah ke tab Expert saat diklik", () => {
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByText(`Expert (${mockAssignments.length})`));
    // AssignmentManager merender expert satu
    expect(screen.getByText("Expert Satu")).toBeInTheDocument();
  });

  it("harus berpindah ke tab Hasil CVI saat diklik", () => {
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByText("Hasil CVI"));
    // CVISection merender tombol Hitung CVI
    expect(screen.getByRole("button", { name: /hitung cvi/i })).toBeInTheDocument();
  });

  it("harus menampilkan form edit instrumen di tab Informasi", () => {
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    expect(screen.getByRole("button", { name: /simpan perubahan/i })).toBeInTheDocument();
  });

  it("harus meminta konfirmasi sebelum menghapus instrumen", () => {
    mockConfirm.mockReturnValue(false);
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    const deleteButton = screen.getByRole("button", { name: /hapus instrumen/i });
    fireEvent.click(deleteButton);
    expect(mockConfirm).toHaveBeenCalled();
  });

  it("harus memanggil PATCH API saat simpan perubahan berhasil", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockInstrument });
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /simpan perubahan/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/instruments/${mockInstrument.id}`,
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });

  it("harus menampilkan pesan sukses setelah simpan berhasil", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockInstrument });
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /simpan perubahan/i }));
    await waitFor(() => {
      expect(screen.getByText(/perubahan berhasil disimpan/i)).toBeInTheDocument();
    });
  });

  it("harus menampilkan error saat simpan gagal", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Instrumen tidak ditemukan" }),
    });
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /simpan perubahan/i }));
    await waitFor(() => {
      expect(screen.getByText("Instrumen tidak ditemukan")).toBeInTheDocument();
    });
  });

  it("harus memanggil DELETE API saat hapus dikonfirmasi", async () => {
    // Konfirmasi pertama dan kedua (double confirm)
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /hapus instrumen/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/instruments/${mockInstrument.id}`,
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  it("harus menampilkan nama instrumen di form informasi", () => {
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    expect(screen.getByDisplayValue(mockInstrument.name)).toBeInTheDocument();
  });

  it("harus mengizinkan perubahan deskripsi instrumen", () => {
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    const descTextarea = screen.getByDisplayValue("Deskripsi instrumen");
    fireEvent.change(descTextarea, { target: { value: "Deskripsi baru" } });
    expect(screen.getByDisplayValue("Deskripsi baru")).toBeInTheDocument();
  });

  it("harus mengizinkan perubahan versi instrumen", () => {
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    const versionInput = screen.getByDisplayValue("1.0");
    fireEvent.change(versionInput, { target: { value: "2.0" } });
    expect(screen.getByDisplayValue("2.0")).toBeInTheDocument();
  });

  it("harus mengizinkan perubahan status instrumen", () => {
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    // Status "draft" ditampilkan sebagai "Draf" di select
    const statusSelect = screen.getByDisplayValue("Draf");
    fireEvent.change(statusSelect, { target: { value: "active" } });
    expect(screen.getByDisplayValue("Aktif")).toBeInTheDocument();
  });

  it("harus menghentikan hapus saat konfirmasi kedua ditolak", () => {
    // Konfirmasi pertama = true, kedua = false
    mockConfirm.mockReturnValueOnce(true).mockReturnValueOnce(false);
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /hapus instrumen/i }));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("harus menampilkan error saat hapus gagal", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Gagal hapus instrumen" }),
    });
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /hapus instrumen/i }));
    await waitFor(() => {
      expect(screen.getByText("Gagal hapus instrumen")).toBeInTheDocument();
    });
  });

  it("harus menampilkan error saat nama instrumen dikosongkan", async () => {
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    const nameInput = screen.getByDisplayValue(mockInstrument.name);
    fireEvent.change(nameInput, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /simpan perubahan/i }));
    await waitFor(() => {
      expect(screen.getByText(/nama instrumen tidak boleh kosong/i)).toBeInTheDocument();
    });
  });

  it("harus menampilkan tab Dimensi dengan jumlah domain", () => {
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    expect(screen.getByText(`Dimensi (${mockDomains.length})`)).toBeInTheDocument();
  });

  it("harus berpindah ke tab Dimensi saat diklik", () => {
    render(
      <InstrumentDetailTabs
        instrument={mockInstrument}
        items={mockItems}
        domains={mockDomains}
        assignments={mockAssignments}
        experts={mockExperts}
      />,
    );
    fireEvent.click(screen.getByText(`Dimensi (${mockDomains.length})`));
    // DomainsManager merender domain
    expect(screen.getByText("Kognitif")).toBeInTheDocument();
    expect(screen.getByText("Afektif")).toBeInTheDocument();
  });
});
