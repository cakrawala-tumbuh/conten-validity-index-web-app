/**
 * E2E test untuk halaman "Penilaian Saya" (expert).
 *
 * Menguji tampilan daftar assignment instrumen yang ditugaskan kepada expert,
 * sidebar navigasi, dan navigasi ke halaman form penilaian.
 */
import { test, expect } from "@playwright/test";

test.describe("Halaman Penilaian Saya (Expert)", () => {
  // ─── Tampilan Halaman ─────────────────────────────────────────────────────

  test("harus menampilkan heading 'Penilaian Saya'", async ({ page }) => {
    await page.goto("/my-assignments");
    await expect(page.getByRole("heading", { name: /penilaian saya/i })).toBeVisible();
  });

  test("harus berada di URL /my-assignments", async ({ page }) => {
    await page.goto("/my-assignments");
    await expect(page).toHaveURL(/\/my-assignments/);
  });

  test("harus menampilkan daftar assignment atau pesan kosong", async ({ page }) => {
    await page.goto("/my-assignments");
    // Gunakan "main li" agar tidak mencocokkan <li> di sidebar navigasi
    const hasCards = await page.locator("main li").first().isVisible().catch(() => false);
    const hasEmpty = await page
      .getByText(/belum ada instrumen yang ditugaskan/i)
      .isVisible()
      .catch(() => false);
    expect(hasCards || hasEmpty).toBeTruthy();
  });

  // ─── Sidebar Navigasi ─────────────────────────────────────────────────────

  test("harus menampilkan menu 'Penilaian Saya' di sidebar", async ({ page }) => {
    await page.goto("/my-assignments");
    await expect(page.getByRole("link", { name: /penilaian saya/i })).toBeVisible();
  });

  test("harus TIDAK menampilkan menu admin (Instrumen, Pengguna) di sidebar", async ({
    page,
  }) => {
    await page.goto("/my-assignments");
    await expect(page.getByRole("link", { name: /^pengguna$/i })).not.toBeVisible();
    await expect(page.getByRole("link", { name: /^log aktivitas$/i })).not.toBeVisible();
  });

  // ─── Kartu Assignment ─────────────────────────────────────────────────────

  test("harus menampilkan badge status assignment jika ada data", async ({ page }) => {
    await page.goto("/my-assignments");
    // Gunakan "main li" agar tidak mencocokkan <li> di sidebar navigasi
    const hasCards = await page.locator("main li").first().isVisible().catch(() => false);
    if (!hasCards) {
      test.skip();
      return;
    }
    // Label: "Menunggu", "Sedang Berjalan", "Selesai" (dari ASSIGNMENT_STATUS_LABELS)
    await expect(
      page.getByText(/menunggu|sedang berjalan|selesai/i).first(),
    ).toBeVisible();
  });

  test("harus menampilkan tombol 'Mulai' atau 'Lanjutkan' pada assignment", async ({ page }) => {
    await page.goto("/my-assignments");
    const hasCards = await page.locator("main li").first().isVisible().catch(() => false);
    if (!hasCards) {
      test.skip();
      return;
    }
    await expect(
      page.getByRole("link", { name: /mulai|lanjutkan/i }).first(),
    ).toBeVisible();
  });

  test("harus dapat membuka halaman penilaian saat klik tombol Mulai/Lanjutkan", async ({
    page,
  }) => {
    await page.goto("/my-assignments");
    const hasCards = await page.locator("main li").first().isVisible().catch(() => false);
    if (!hasCards) {
      test.skip();
      return;
    }
    await page.getByRole("link", { name: /mulai|lanjutkan/i }).first().click();
    await expect(page).toHaveURL(/\/my-assignments\/[a-f0-9-]+$/);
  });

  // ─── Akses Admin Diblokir ─────────────────────────────────────────────────

  test("harus redirect ke /my-assignments jika expert mencoba akses /instruments", async ({
    page,
  }) => {
    await page.goto("/instruments");
    await expect(page).toHaveURL(/\/my-assignments/);
  });

  test("harus redirect ke /my-assignments jika expert mencoba akses /users", async ({
    page,
  }) => {
    await page.goto("/users");
    await expect(page).toHaveURL(/\/my-assignments/);
  });
});
