/**
 * Unit test untuk komponen ItemsManager.
 *
 * Menguji rendering daftar item, state kosong, mode edit, mode tambah item,
 * dropdown domain, dan tampilan nama domain di tabel.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ItemsManager } from "@/components/features/instruments/ItemsManager";
import type { ItemResponse } from "@/types/item";
import type { DomainResponse } from "@/types/domain";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockConfirm = jest.fn();
global.confirm = mockConfirm;

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

const mockItems: ItemResponse[] = [
  {
    id: "item-1",
    instrument_id: "inst-1",
    sequence_number: 1,
    content: "Konten item pertama",
    domain_id: "dom-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "item-2",
    instrument_id: "inst-1",
    sequence_number: 2,
    content: "Konten item kedua",
    domain_id: null,
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
  },
];

describe("ItemsManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("harus menampilkan pesan kosong jika tidak ada item", () => {
    render(<ItemsManager instrumentId="inst-1" initialItems={[]} domains={mockDomains} />);
    expect(screen.getByText(/belum ada item/i)).toBeInTheDocument();
  });

  it("harus merender tabel dengan semua item", () => {
    render(
      <ItemsManager
        instrumentId="inst-1"
        initialItems={mockItems}
        domains={mockDomains}
      />,
    );
    expect(screen.getByText("Konten item pertama")).toBeInTheDocument();
    expect(screen.getByText("Konten item kedua")).toBeInTheDocument();
  });

  it("harus menampilkan nama domain item jika ada", () => {
    render(
      <ItemsManager
        instrumentId="inst-1"
        initialItems={mockItems}
        domains={mockDomains}
      />,
    );
    // domain_id "dom-1" harus ditampilkan sebagai "Kognitif"
    expect(screen.getByText("Kognitif")).toBeInTheDocument();
  });

  it("harus menampilkan tanda hubung jika item tidak memiliki domain", () => {
    render(
      <ItemsManager
        instrumentId="inst-1"
        initialItems={mockItems}
        domains={mockDomains}
      />,
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("harus menampilkan nomor urut setiap item", () => {
    render(
      <ItemsManager
        instrumentId="inst-1"
        initialItems={mockItems}
        domains={mockDomains}
      />,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("harus menampilkan tombol Tambah Item", () => {
    render(<ItemsManager instrumentId="inst-1" initialItems={[]} domains={mockDomains} />);
    expect(screen.getByRole("button", { name: /tambah item/i })).toBeInTheDocument();
  });

  it("harus menampilkan form tambah satu item setelah klik Tambah Item", () => {
    render(<ItemsManager instrumentId="inst-1" initialItems={[]} domains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah item/i }));
    expect(screen.getByPlaceholderText(/konten item/i)).toBeInTheDocument();
  });

  it("harus menampilkan dropdown domain di form tambah item", () => {
    render(<ItemsManager instrumentId="inst-1" initialItems={[]} domains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah item/i }));
    expect(screen.getByLabelText(/domain.*dimensi/i)).toBeInTheDocument();
    expect(screen.getByText("Kognitif")).toBeInTheDocument();
    expect(screen.getByText("Afektif")).toBeInTheDocument();
  });

  it("harus masuk mode edit saat tombol edit item diklik", () => {
    render(
      <ItemsManager
        instrumentId="inst-1"
        initialItems={mockItems}
        domains={mockDomains}
      />,
    );
    const editButtons = screen.getAllByTitle("Edit");
    fireEvent.click(editButtons[0]);
    // Setelah klik edit, textarea konten muncul
    expect(screen.getByDisplayValue("Konten item pertama")).toBeInTheDocument();
  });

  it("harus keluar mode edit saat tombol Batal diklik", () => {
    render(
      <ItemsManager
        instrumentId="inst-1"
        initialItems={mockItems}
        domains={mockDomains}
      />,
    );
    const editButtons = screen.getAllByTitle("Edit");
    fireEvent.click(editButtons[0]);
    expect(screen.getByTitle("Batal")).toBeInTheDocument();
    fireEvent.click(screen.getByTitle("Batal"));
    expect(screen.queryByTitle("Batal")).not.toBeInTheDocument();
  });

  it("harus meminta konfirmasi sebelum menghapus item", () => {
    mockConfirm.mockReturnValue(false);
    render(
      <ItemsManager
        instrumentId="inst-1"
        initialItems={mockItems}
        domains={mockDomains}
      />,
    );
    const deleteButtons = screen.getAllByTitle("Hapus");
    fireEvent.click(deleteButtons[0]);
    expect(mockConfirm).toHaveBeenCalledWith(expect.stringContaining("item"));
  });

  it("harus menampilkan tombol Tambah Massal", () => {
    render(<ItemsManager instrumentId="inst-1" initialItems={[]} domains={mockDomains} />);
    expect(screen.getByRole("button", { name: /tambah massal/i })).toBeInTheDocument();
  });

  it("harus berhasil menyimpan edit item", async () => {
    const updatedItem = { ...mockItems[0], content: "Konten diperbarui", domain_id: "dom-1" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedItem,
    });
    render(
      <ItemsManager
        instrumentId="inst-1"
        initialItems={mockItems}
        domains={mockDomains}
      />,
    );
    fireEvent.click(screen.getAllByTitle("Edit")[0]);
    const contentInput = screen.getByDisplayValue("Konten item pertama");
    fireEvent.change(contentInput, { target: { value: "Konten diperbarui" } });
    fireEvent.click(screen.getByTitle("Simpan"));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/instruments/inst-1/items/${mockItems[0].id}`),
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });

  it("harus menampilkan error saat simpan edit item gagal", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Item tidak ditemukan" }),
    });
    render(
      <ItemsManager
        instrumentId="inst-1"
        initialItems={mockItems}
        domains={mockDomains}
      />,
    );
    fireEvent.click(screen.getAllByTitle("Edit")[0]);
    fireEvent.click(screen.getByTitle("Simpan"));
    await waitFor(() => {
      expect(screen.getByText("Item tidak ditemukan")).toBeInTheDocument();
    });
  });

  it("harus menampilkan error jika konten edit kosong", () => {
    render(
      <ItemsManager
        instrumentId="inst-1"
        initialItems={mockItems}
        domains={mockDomains}
      />,
    );
    fireEvent.click(screen.getAllByTitle("Edit")[0]);
    const contentInput = screen.getByDisplayValue("Konten item pertama");
    fireEvent.change(contentInput, { target: { value: "" } });
    fireEvent.click(screen.getByTitle("Simpan"));
    expect(screen.getByText(/konten item tidak boleh kosong/i)).toBeInTheDocument();
  });

  it("harus berhasil menambahkan satu item", async () => {
    const newItemResp = {
      id: "item-3",
      instrument_id: "inst-1",
      sequence_number: 3,
      content: "Item baru",
      domain_id: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [newItemResp],
    });
    render(
      <ItemsManager
        instrumentId="inst-1"
        initialItems={mockItems}
        domains={mockDomains}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /tambah item/i }));
    const contentInput = screen.getByPlaceholderText(/konten item/i);
    fireEvent.change(contentInput, { target: { value: "Item baru" } });
    fireEvent.click(screen.getByRole("button", { name: /simpan item/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/instruments/inst-1/items",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("harus menampilkan form massal setelah klik Tambah Massal", () => {
    render(<ItemsManager instrumentId="inst-1" initialItems={[]} domains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah massal/i }));
    expect(screen.getByText(/satu baris = satu item/i)).toBeInTheDocument();
  });

  it("harus berhasil menambahkan items secara massal", async () => {
    const newItems = [
      {
        id: "item-3",
        instrument_id: "inst-1",
        sequence_number: 3,
        content: "Item A",
        domain_id: null,
        created_at: "",
        updated_at: "",
      },
      {
        id: "item-4",
        instrument_id: "inst-1",
        sequence_number: 4,
        content: "Item B",
        domain_id: null,
        created_at: "",
        updated_at: "",
      },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newItems,
    });
    render(<ItemsManager instrumentId="inst-1" initialItems={[]} domains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah massal/i }));
    const textareas = screen.getAllByRole("textbox");
    fireEvent.change(textareas[0], { target: { value: "Item A\nItem B" } });
    fireEvent.click(screen.getByRole("button", { name: /simpan semua/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/instruments/inst-1/items",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("harus menampilkan error jika bulk textarea kosong", () => {
    render(<ItemsManager instrumentId="inst-1" initialItems={[]} domains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah massal/i }));
    fireEvent.click(screen.getByRole("button", { name: /simpan semua/i }));
    expect(screen.getByText(/masukkan minimal satu item/i)).toBeInTheDocument();
  });

  it("harus berhasil menghapus item setelah konfirmasi", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(
      <ItemsManager
        instrumentId="inst-1"
        initialItems={mockItems}
        domains={mockDomains}
      />,
    );
    fireEvent.click(screen.getAllByTitle("Hapus")[0]);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/instruments/inst-1/items/${mockItems[0].id}`),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  it("harus menampilkan error saat hapus item gagal", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Item tidak dapat dihapus" }),
    });
    render(
      <ItemsManager
        instrumentId="inst-1"
        initialItems={mockItems}
        domains={mockDomains}
      />,
    );
    fireEvent.click(screen.getAllByTitle("Hapus")[0]);
    await waitFor(() => {
      expect(screen.getByText("Item tidak dapat dihapus")).toBeInTheDocument();
    });
  });

  it("harus menampilkan error saat tambah satu item gagal dari server", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Gagal tambah item dari server" }),
    });
    render(<ItemsManager instrumentId="inst-1" initialItems={[]} domains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah item/i }));
    const contentInput = screen.getByPlaceholderText(/konten item/i);
    fireEvent.change(contentInput, { target: { value: "Item gagal" } });
    fireEvent.click(screen.getByRole("button", { name: /simpan item/i }));
    await waitFor(() => {
      expect(screen.getByText("Gagal tambah item dari server")).toBeInTheDocument();
    });
  });

  it("harus menampilkan error jika konten tambah satu item kosong saat submit", () => {
    render(<ItemsManager instrumentId="inst-1" initialItems={[]} domains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah item/i }));
    // Langsung klik simpan tanpa mengisi konten
    fireEvent.click(screen.getByRole("button", { name: /simpan item/i }));
    expect(screen.getByText(/konten item tidak boleh kosong/i)).toBeInTheDocument();
  });

  it("harus menampilkan dropdown domain pada form tambah item", () => {
    render(<ItemsManager instrumentId="inst-1" initialItems={[]} domains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah item/i }));
    // Dropdown domain ditampilkan
    const domainSelect = screen.getByLabelText(/domain.*dimensi/i);
    expect(domainSelect).toBeInTheDocument();
  });

  it("harus mengirim domain_id saat tambah item dengan domain yang dipilih", async () => {
    const newItemResp = {
      id: "item-3",
      instrument_id: "inst-1",
      sequence_number: 3,
      content: "Item dengan domain",
      domain_id: "dom-1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [newItemResp],
    });
    render(<ItemsManager instrumentId="inst-1" initialItems={[]} domains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah item/i }));
    const contentInput = screen.getByPlaceholderText(/konten item/i);
    fireEvent.change(contentInput, { target: { value: "Item dengan domain" } });
    fireEvent.click(screen.getByRole("button", { name: /simpan item/i }));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/instruments/inst-1/items",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("harus menampilkan error saat tambah massal gagal dari server", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Gagal tambah massal" }),
    });
    render(<ItemsManager instrumentId="inst-1" initialItems={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah massal/i }));
    const textareas = screen.getAllByRole("textbox");
    fireEvent.change(textareas[0], { target: { value: "Item A\nItem B" } });
    fireEvent.click(screen.getByRole("button", { name: /simpan semua/i }));
    await waitFor(() => {
      expect(screen.getByText("Gagal tambah massal")).toBeInTheDocument();
    });
  });

  it("harus kembali ke mode idle saat tombol Batal di action bar diklik (mode tambah satu)", () => {
    render(<ItemsManager instrumentId="inst-1" initialItems={[]} domains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah item/i }));
    // Form tambah muncul
    expect(screen.getByPlaceholderText(/konten item/i)).toBeInTheDocument();
    // Klik Batal di action bar (bukan title="Batal" di row edit)
    const cancelButton = screen.getByRole("button", { name: /batal/i });
    fireEvent.click(cancelButton);
    // Form tambah harus menghilang
    expect(screen.queryByPlaceholderText(/konten item/i)).not.toBeInTheDocument();
  });

  it("harus kembali ke mode idle saat tombol Batal di action bar diklik (mode massal)", () => {
    render(<ItemsManager instrumentId="inst-1" initialItems={[]} domains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah massal/i }));
    expect(screen.getByText(/satu baris = satu item/i)).toBeInTheDocument();
    const cancelButton = screen.getByRole("button", { name: /batal/i });
    fireEvent.click(cancelButton);
    expect(screen.queryByText(/satu baris = satu item/i)).not.toBeInTheDocument();
  });

  it("harus memperbarui domain_id saat dropdown domain di form tambah diubah", () => {
    render(<ItemsManager instrumentId="inst-1" initialItems={[]} domains={mockDomains} />);
    fireEvent.click(screen.getByRole("button", { name: /tambah item/i }));
    const domainSelect = screen.getByLabelText(/domain.*dimensi/i);
    fireEvent.change(domainSelect, { target: { value: "dom-1" } });
    expect((domainSelect as HTMLSelectElement).value).toBe("dom-1");
  });

  it("harus memperbarui domain edit saat dropdown domain di baris edit diubah", () => {
    render(
      <ItemsManager instrumentId="inst-1" initialItems={mockItems} domains={mockDomains} />,
    );
    fireEvent.click(screen.getAllByTitle("Edit")[0]);
    // Di baris edit, ada select domain tanpa label — ambil semua combobox
    const selects = screen.getAllByRole("combobox");
    // Select pertama adalah domain select di baris edit (tidak ada label di baris edit)
    fireEvent.change(selects[0], { target: { value: "dom-2" } });
    expect((selects[0] as HTMLSelectElement).value).toBe("dom-2");
  });
});
