/**
 * E2E test untuk alur autentikasi.
 *
 * Menguji halaman login, redirect setelah login, dan logout.
 * Dijalankan sebagai "unauthenticated" project (tanpa storageState).
 */
import { test, expect } from "@playwright/test";

test.describe("Halaman Login", () => {
  test("harus menampilkan tombol 'Masuk dengan Authentik'", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /masuk dengan authentik/i })).toBeVisible();
  });

  test("harus menampilkan nama aplikasi", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/content validity index/i)).toBeVisible();
  });

  test("harus redirect ke login jika mengakses halaman protected tanpa auth", async ({
    page,
  }) => {
    await page.goto("/instruments");
    await expect(page).toHaveURL(/\/login/);
  });

  test("harus redirect ke login jika mengakses /my-assignments tanpa auth", async ({ page }) => {
    await page.goto("/my-assignments");
    await expect(page).toHaveURL(/\/login/);
  });
});
