/**
 * Unit test untuk komponen Tooltip dan TableInfoTooltip.
 *
 * Menguji bahwa balon penjelasan hanya muncul saat pemicu di-hover atau
 * di-focus, menutup kembali saat pointer keluar/focus hilang, serta bahwa
 * TableInfoTooltip menampilkan ikon informasi dengan label aksesibel.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { Tooltip, TableInfoTooltip } from "@/components/ui/Tooltip";

describe("Tooltip", () => {
  it("tidak menampilkan konten tooltip sebelum di-hover", () => {
    render(
      <Tooltip content="Penjelasan singkat">
        <button type="button">Pemicu</button>
      </Tooltip>,
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("menampilkan konten tooltip saat pemicu di-hover dan menyembunyikannya saat pointer keluar", () => {
    render(
      <Tooltip content="Penjelasan singkat">
        <button type="button">Pemicu</button>
      </Tooltip>,
    );
    // React menurunkan onMouseEnter/Leave dari event mouseover/mouseout.
    fireEvent.mouseOver(screen.getByText("Pemicu"));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Penjelasan singkat");
    fireEvent.mouseOut(screen.getByText("Pemicu"));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("menampilkan konten tooltip saat pemicu menerima focus", () => {
    render(
      <Tooltip content="Penjelasan singkat">
        <button type="button">Pemicu</button>
      </Tooltip>,
    );
    fireEvent.focus(screen.getByText("Pemicu"));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });
});

describe("TableInfoTooltip", () => {
  it("menampilkan ikon informasi dengan label aksesibel default", () => {
    render(<TableInfoTooltip description="Penjelasan tabel uji" />);
    expect(screen.getByRole("button", { name: /penjelasan tabel/i })).toBeInTheDocument();
  });

  it("menampilkan deskripsi tabel saat ikon di-hover", () => {
    render(<TableInfoTooltip description="Penjelasan tabel uji" />);
    fireEvent.mouseOver(screen.getByRole("button", { name: /penjelasan tabel/i }));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Penjelasan tabel uji");
  });

  it("menggunakan label aksesibel kustom bila diberikan", () => {
    render(<TableInfoTooltip description="Penjelasan" label="Info daftar item" />);
    expect(screen.getByRole("button", { name: /info daftar item/i })).toBeInTheDocument();
  });
});
