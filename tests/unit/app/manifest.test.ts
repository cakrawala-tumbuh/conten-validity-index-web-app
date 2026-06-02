/**
 * Unit test untuk web app manifest PWA.
 *
 * Menguji bahwa manifest memiliki field wajib untuk installability:
 * nama, ikon (192 & 512 + maskable), display standalone, start_url,
 * serta warna tema/latar.
 */
import manifest from "@/app/manifest";
import {
  APP_BACKGROUND_COLOR,
  APP_DESCRIPTION,
  APP_NAME,
  APP_SHORT_NAME,
  APP_THEME_COLOR,
} from "@/constants";

describe("manifest", () => {
  const result = manifest();

  it("harus memakai nama dan short_name dari konstanta branding", () => {
    expect(result.name).toBe(APP_NAME);
    expect(result.short_name).toBe(APP_SHORT_NAME);
    expect(result.description).toBe(APP_DESCRIPTION);
  });

  it("harus menggunakan display standalone dan start_url root", () => {
    expect(result.display).toBe("standalone");
    expect(result.start_url).toBe("/");
    expect(result.scope).toBe("/");
  });

  it("harus memakai warna tema dan latar dari konstanta branding", () => {
    expect(result.theme_color).toBe(APP_THEME_COLOR);
    expect(result.background_color).toBe(APP_BACKGROUND_COLOR);
  });

  it("harus menyertakan ikon 192 dan 512 piksel", () => {
    const sizes = (result.icons ?? []).map((icon) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });

  it("harus menyertakan minimal satu ikon maskable", () => {
    const maskable = (result.icons ?? []).filter((icon) => icon.purpose === "maskable");
    expect(maskable.length).toBeGreaterThanOrEqual(1);
  });

  it("semua ikon harus bertipe PNG dan menunjuk ke /icons/", () => {
    for (const icon of result.icons ?? []) {
      expect(icon.type).toBe("image/png");
      expect(icon.src.startsWith("/icons/")).toBe(true);
    }
  });
});
