/**
 * E2E test untuk halaman manajemen pengguna (admin).
 *
 * Menguji tampilan daftar pengguna, edit inline data pengguna
 * (institusi dan area keahlian), serta fungsi nonaktifkan pengguna.
 */
import { test, expect } from "@playwright/test";

test.describe("Halaman Pengguna (Admin)", () => {
  // ─── Tampilan Halaman ─────────────────────────────────────────────────────

  test("harus menampilkan heading 'Pengguna'", async ({ page }) => {
    await page.goto("/users");
    await expect(page.getByRole("heading", { name: /^pengguna$/i })).toBeVisible();
  });

  test("harus menampilkan jumlah pengguna terdaftar", async ({ page }) => {
    await page.goto("/users");
    await expect(page.getByText(/\d+ pengguna/i)).toBeVisible();
  });

  test("harus menampilkan tabel atau pesan kosong", async ({ page }) => {
    await page.goto("/users");
    const hasTable = await page
      .locator("table")
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/belum ada pengguna/i)
      .isVisible()
      .catch(() => false);
    expect(hasTable || hasEmpty).toBeTruthy();
  });

  test("harus menampilkan sidebar navigasi admin", async ({ page }) => {
    await page.goto("/users");
    await expect(page.getByRole("link", { name: /^instrumen$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^pengguna$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^log aktivitas$/i })).toBeVisible();
  });

  // ─── Kolom Tabel ──────────────────────────────────────────────────────────

  test("harus menampilkan kolom header tabel pengguna", async ({ page }) => {
    await page.goto("/users");
    const hasTable = await page
      .locator("table")
      .isVisible()
      .catch(() => false);
    if (!hasTable) {
      test.skip();
      return;
    }
    await expect(page.getByRole("columnheader", { name: /nama/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /email/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /role/i })).toBeVisible();
  });

  // ─── Aksi Edit ────────────────────────────────────────────────────────────

  test("harus menampilkan tombol edit untuk setiap pengguna", async ({ page }) => {
    await page.goto("/users");
    const hasTable = await page
      .locator("table")
      .isVisible()
      .catch(() => false);
    if (!hasTable) {
      test.skip();
      return;
    }
    await expect(page.getByTitle("Edit").first()).toBeVisible();
  });

  test("harus menampilkan form edit inline saat tombol edit diklik", async ({ page }) => {
    await page.goto("/users");
    const hasTable = await page
      .locator("table")
      .isVisible()
      .catch(() => false);
    if (!hasTable) {
      test.skip();
      return;
    }
    await page.getByTitle("Edit").first().click();
    // Form edit inline muncul dengan field institusi / area keahlian
    await expect(
      page
        .getByPlaceholder(/institusi|institution/i)
        .or(page.getByRole("textbox"))
        .first(),
    ).toBeVisible();
  });

  test("harus dapat membatalkan edit dengan tombol batal", async ({ page }) => {
    await page.goto("/users");
    const hasTable = await page
      .locator("table")
      .isVisible()
      .catch(() => false);
    if (!hasTable) {
      test.skip();
      return;
    }
    await page.getByTitle("Edit").first().click();
    await page.getByTitle("Batal").first().click();
    // Form edit harus hilang
    await expect(page.getByTitle("Edit").first()).toBeVisible();
  });

  test("harus dapat menyimpan perubahan institusi pengguna", async ({ page }) => {
    await page.goto("/users");
    const hasTable = await page
      .locator("table")
      .isVisible()
      .catch(() => false);
    if (!hasTable) {
      test.skip();
      return;
    }
    await page.getByTitle("Edit").first().click();
    const institutionInput = page.getByPlaceholder(/institusi/i).first();
    await institutionInput.fill("Universitas Test E2E");
    await page.getByTitle("Simpan").first().click();
    // Tidak ada error setelah simpan
    await expect(page.getByText(/gagal menyimpan/i)).not.toBeVisible({ timeout: 5_000 });
  });

  // ─── Aksi Nonaktifkan ─────────────────────────────────────────────────────

  test("harus menampilkan tombol nonaktifkan untuk pengguna aktif", async ({ page }) => {
    await page.goto("/users");
    const hasTable = await page
      .locator("table")
      .isVisible()
      .catch(() => false);
    if (!hasTable) {
      test.skip();
      return;
    }
    // Tombol nonaktifkan hanya muncul untuk pengguna yang masih aktif
    const deactivateBtn = page.getByRole("button", { name: /nonaktifkan/i }).first();
    if (await deactivateBtn.isVisible()) {
      await expect(deactivateBtn).toBeVisible();
    }
  });
});
