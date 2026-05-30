/**
 * E2E test untuk halaman penilaian expert.
 *
 * Menguji akses halaman "Penilaian Saya" dan tampilan daftar assignment.
 */
import { test, expect } from "@playwright/test";

test.describe("Halaman Penilaian Saya (Expert)", () => {
  test("harus menampilkan halaman penilaian setelah login sebagai expert", async ({ page }) => {
    await page.goto("/my-assignments");
    await expect(page).toHaveURL(/\/my-assignments/);
    await expect(page.getByRole("heading", { name: /penilaian saya/i })).toBeVisible();
  });

  test("harus menampilkan sidebar navigasi expert", async ({ page }) => {
    await page.goto("/my-assignments");
    await expect(page.getByRole("link", { name: /penilaian saya/i })).toBeVisible();
    // Expert tidak harus melihat menu admin
    await expect(page.getByRole("link", { name: /pengguna/i })).not.toBeVisible();
  });
});
