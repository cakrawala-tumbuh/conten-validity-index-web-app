/**
 * E2E test untuk alur autentikasi.
 *
 * Menguji halaman login, redirect ke halaman protected tanpa auth,
 * dan tampilan elemen-elemen halaman login.
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

  test("harus menampilkan judul atau heading halaman login", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/cvi|content validity index/i);
  });

  test("harus redirect ke /login jika mengakses /instruments tanpa auth", async ({ page }) => {
    await page.goto("/instruments");
    await expect(page).toHaveURL(/\/login/);
  });

  test("harus redirect ke /login jika mengakses /my-assignments tanpa auth", async ({ page }) => {
    await page.goto("/my-assignments");
    await expect(page).toHaveURL(/\/login/);
  });

  test("harus redirect ke /login jika mengakses /users tanpa auth", async ({ page }) => {
    await page.goto("/users");
    await expect(page).toHaveURL(/\/login/);
  });

  test("harus redirect ke /login jika mengakses /activity-logs tanpa auth", async ({ page }) => {
    await page.goto("/activity-logs");
    await expect(page).toHaveURL(/\/login/);
  });

  test("harus redirect ke /login jika mengakses / tanpa auth", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });
});
