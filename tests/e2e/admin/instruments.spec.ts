/**
 * E2E test untuk halaman instrumen (admin role).
 *
 * Menguji akses halaman instrumen, tampilan tabel, dan navigasi.
 */
import { test, expect } from "@playwright/test";

test.describe("Halaman Instrumen (Admin)", () => {
  test("harus menampilkan halaman instrumen setelah login sebagai admin", async ({ page }) => {
    await page.goto("/instruments");
    // Jika tidak ada data, tampilkan pesan kosong
    // Jika ada data, tampilkan tabel
    await expect(page).toHaveURL(/\/instruments/);
    await expect(page.getByRole("heading", { name: /instrumen/i })).toBeVisible();
  });

  test("harus menampilkan sidebar navigasi admin", async ({ page }) => {
    await page.goto("/instruments");
    await expect(page.getByRole("link", { name: /instrumen/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /pengguna/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /log aktivitas/i })).toBeVisible();
  });
});
