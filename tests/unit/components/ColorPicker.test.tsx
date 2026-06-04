/**
 * Unit test untuk komponen ColorPicker.
 *
 * Menguji pemilihan warna lewat swatch preset, tombol "tanpa warna",
 * input teks hex, serta penandaan swatch yang sedang terpilih.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { ColorPicker } from "@/components/ui/ColorPicker";

describe("ColorPicker", () => {
  it("harus memanggil onChange dengan hex saat swatch preset diklik", () => {
    const onChange = jest.fn();
    render(<ColorPicker value={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /pilih warna #FDE68A/i }));
    expect(onChange).toHaveBeenCalledWith("#FDE68A");
  });

  it("harus memanggil onChange dengan null saat tombol tanpa warna diklik", () => {
    const onChange = jest.fn();
    render(<ColorPicker value="#FDE68A" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /tanpa warna/i }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("harus meneruskan hex valid yang diketik pada input teks", () => {
    const onChange = jest.fn();
    render(<ColorPicker value={null} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText("#RRGGBB"), {
      target: { value: "#A7F3D0" },
    });
    expect(onChange).toHaveBeenCalledWith("#A7F3D0");
  });

  it("harus menambahkan prefix # otomatis pada input hex tanpa #", () => {
    const onChange = jest.fn();
    render(<ColorPicker value={null} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText("#RRGGBB"), {
      target: { value: "BFDBFE" },
    });
    expect(onChange).toHaveBeenCalledWith("#BFDBFE");
  });

  it("tidak boleh memanggil onChange untuk hex yang belum lengkap/invalid", () => {
    const onChange = jest.fn();
    render(<ColorPicker value={null} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText("#RRGGBB"), {
      target: { value: "#A7F" },
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("harus memanggil onChange dengan null saat input teks dikosongkan", () => {
    const onChange = jest.fn();
    render(<ColorPicker value="#A7F3D0" onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText("#RRGGBB"), {
      target: { value: "" },
    });
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("harus menampilkan keterangan warna latar saat ada warna terpilih", () => {
    render(<ColorPicker value="#FDE68A" onChange={jest.fn()} />);
    expect(screen.getByText(/warna latar dimensi/i)).toBeInTheDocument();
  });
});
