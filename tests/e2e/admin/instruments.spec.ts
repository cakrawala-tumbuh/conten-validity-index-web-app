/**
 * E2E test untuk halaman daftar instrumen dan pembuatan instrumen baru (admin).
 *
 * Menguji tampilan tabel instrumen, sidebar navigasi admin, tombol aksi,
 * serta alur pembuatan instrumen baru lengkap dengan item-itemnya.
 */
import { test, expect } from "@playwright/test";

test.describe("Halaman Instrumen (Admin)", () => {
  test("harus menampilkan heading 'Instrumen'", async ({ page }) => {
    await page.goto("/instruments");
    await expect(page.getByRole("heading", { name: /^instrumen$/i })).toBeVisible();
  });

  test("harus menampilkan tombol 'Buat Instrumen'", async ({ page }) => {
    await page.goto("/instruments");
    await expect(page.getByRole("link", { name: /buat instrumen/i })).toBeVisible();
  });

  test("harus menampilkan sidebar navigasi admin dengan semua menu", async ({ page }) => {
    await page.goto("/instruments");
    await expect(page.getByRole("link", { name: /^instrumen$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^pengguna$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^log aktivitas$/i })).toBeVisible();
  });

  test("harus menampilkan tabel instrumen atau pesan kosong", async ({ page }) => {
    await page.goto("/instruments");
    const hasTable = await page
      .locator("table")
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/belum ada instrumen/i)
      .isVisible()
      .catch(() => false);
    expect(hasTable || hasEmpty).toBeTruthy();
  });

  test("harus dapat navigasi ke halaman buat instrumen via tombol", async ({ page }) => {
    await page.goto("/instruments");
    await page.getByRole("link", { name: /buat instrumen/i }).click();
    await expect(page).toHaveURL(/\/instruments\/new/);
  });

  test("harus dapat navigasi ke halaman pengguna via sidebar", async ({ page }) => {
    await page.goto("/instruments");
    await page.getByRole("link", { name: /^pengguna$/i }).click();
    await expect(page).toHaveURL(/\/users/);
  });

  test("harus dapat navigasi ke log aktivitas via sidebar", async ({ page }) => {
    await page.goto("/instruments");
    await page.getByRole("link", { name: /^log aktivitas$/i }).click();
    await expect(page).toHaveURL(/\/activity-logs/);
  });
});

test.describe("Halaman Buat Instrumen Baru (Admin)", () => {
  test("harus menampilkan form dengan field yang diperlukan", async ({ page }) => {
    await page.goto("/instruments/new");
    await expect(page.getByRole("heading", { name: /buat instrumen baru/i })).toBeVisible();
    await expect(page.getByLabel(/nama instrumen/i)).toBeVisible();
    await expect(page.getByLabel(/deskripsi/i)).toBeVisible();
    await expect(page.getByLabel(/versi/i)).toBeVisible();
  });

  test("harus menampilkan tombol kembali ke halaman instrumen", async ({ page }) => {
    await page.goto("/instruments/new");
    await expect(page.getByRole("link", { name: /← kembali/i })).toBeVisible();
    await page.getByRole("link", { name: /← kembali/i }).click();
    await expect(page).toHaveURL(/\/instruments$/);
  });

  test("harus menampilkan minimal satu baris input item", async ({ page }) => {
    await page.goto("/instruments/new");
    await expect(page.getByPlaceholder(/konten.*pernyataan item/i)).toBeVisible();
  });

  test("harus dapat menambah baris item baru", async ({ page }) => {
    await page.goto("/instruments/new");
    const addButton = page.getByRole("button", { name: /\+ tambah item/i });
    await expect(addButton).toBeVisible();
    const initialRows = await page.getByPlaceholder(/konten.*pernyataan item/i).count();
    await addButton.click();
    const afterRows = await page.getByPlaceholder(/konten.*pernyataan item/i).count();
    expect(afterRows).toBe(initialRows + 1);
  });

  test("harus dapat menghapus baris item", async ({ page }) => {
    await page.goto("/instruments/new");
    const addButton = page.getByRole("button", { name: /\+ tambah item/i });
    await addButton.click();
    const rowsBefore = await page.getByPlaceholder(/konten.*pernyataan item/i).count();
    await page
      .getByRole("button", { name: /hapus item/i })
      .last()
      .click();
    const rowsAfter = await page.getByPlaceholder(/konten.*pernyataan item/i).count();
    expect(rowsAfter).toBe(rowsBefore - 1);
  });

  test("harus menampilkan error jika submit tanpa nama instrumen", async ({ page }) => {
    await page.goto("/instruments/new");
    // Tombol submit disabled ketika nama kosong
    const submitBtn = page.getByRole("button", { name: /buat instrumen/i });
    await expect(submitBtn).toBeDisabled();
  });

  test("harus berhasil membuat instrumen baru dan redirect ke /instruments", async ({ page }) => {
    const ts = Date.now();
    await page.goto("/instruments/new");

    await page.getByLabel(/nama instrumen/i).fill(`Instrumen Test E2E ${ts}`);
    await page.getByLabel(/deskripsi/i).fill("Deskripsi instrumen test otomatis.");
    await page
      .getByPlaceholder(/konten.*pernyataan item/i)
      .first()
      .fill("Item pertama test");

    await page.getByRole("button", { name: /buat instrumen/i }).click();

    await expect(page).toHaveURL(/\/instruments$/, { timeout: 10_000 });
    await expect(page.getByText(`Instrumen Test E2E ${ts}`)).toBeVisible();
  });
});
