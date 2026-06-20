/**
 * Unit test untuk fungsi utilitas di src/lib/utils.ts.
 *
 * Menguji fungsi `cn`, `interpretCVI`, `formatDate`, `formatCVI`, dan
 * `triggerBlobDownload`.
 */
import { cn, interpretCVI, formatDate, formatCVI, triggerBlobDownload } from "@/lib/utils";

describe("cn()", () => {
  it("harus menggabungkan class names dengan benar", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("harus mengabaikan nilai falsy", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });

  it("harus merge class tailwind yang konflik (tailwind-merge)", () => {
    // tailwind-merge: px-2 dan px-4 → hanya px-4 yang dipakai
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("interpretCVI()", () => {
  it("harus mengembalikan 'valid' jika cvi >= 0.78 dan nExperts >= 6", () => {
    expect(interpretCVI(0.78, 6)).toBe("valid");
    expect(interpretCVI(1.0, 10)).toBe("valid");
  });

  it("harus mengembalikan 'tidak-valid' jika cvi < 0.78 dan nExperts >= 6", () => {
    expect(interpretCVI(0.77, 6)).toBe("tidak-valid");
    expect(interpretCVI(0.0, 7)).toBe("tidak-valid");
  });

  it("harus mengembalikan 'valid' jika cvi >= 0.83 dan nExperts <= 5", () => {
    expect(interpretCVI(0.83, 5)).toBe("valid");
    expect(interpretCVI(0.83, 3)).toBe("valid");
    expect(interpretCVI(1.0, 4)).toBe("valid");
  });

  it("harus mengembalikan 'tidak-valid' jika cvi < 0.83 dan nExperts <= 5", () => {
    expect(interpretCVI(0.82, 5)).toBe("tidak-valid");
    expect(interpretCVI(0.78, 4)).toBe("tidak-valid");
  });
});

describe("formatCVI()", () => {
  it("harus memformat nilai CVI sebagai persentase dengan 2 desimal", () => {
    expect(formatCVI(0.75)).toBe("75.00%");
    expect(formatCVI(1.0)).toBe("100.00%");
    expect(formatCVI(0.0)).toBe("0.00%");
  });
});

describe("formatDate()", () => {
  it("harus memformat tanggal ISO ke format Indonesia", () => {
    const result = formatDate("2024-01-15T10:30:00Z");
    // Format Indonesia menggunakan nama bulan Indonesia
    expect(result).toContain("2024");
    expect(result).toContain("15");
  });

  it("harus mengembalikan string tidak kosong untuk tanggal valid", () => {
    expect(formatDate("2024-06-01T00:00:00Z")).not.toBe("");
  });
});

describe("triggerBlobDownload()", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("harus melampirkan anchor ke DOM, mengkliknya, lalu menghapusnya", () => {
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const appendSpy = jest.spyOn(document.body, "appendChild");
    const removeSpy = jest.spyOn(document.body, "removeChild");

    triggerBlobDownload(new Blob(["{}"], { type: "application/json" }), "data.json");

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    // Anchor tidak boleh tertinggal di DOM setelah unduhan dipicu.
    expect(document.querySelector("a[download]")).toBeNull();
  });

  it("harus menunda pembatalan object URL hingga setelah unduhan dimulai", () => {
    jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    triggerBlobDownload(new Blob(["{}"]), "data.json");

    // Belum dibatalkan secara sinkron pada frame yang sama dengan click().
    expect(global.URL.revokeObjectURL).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});
