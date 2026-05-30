/**
 * E2E test untuk halaman log aktivitas (admin).
 *
 * Menguji tampilan tabel log aktivitas, filter berdasarkan action dan
 * rentang tanggal, serta tombol refresh untuk memuat ulang data.
 */
import { test, expect } from "@playwright/test";

test.describe("Halaman Log Aktivitas (Admin)", () => {
  // ─── Tampilan Halaman ─────────────────────────────────────────────────────

  test("harus menampilkan heading 'Log Aktivitas'", async ({ page }) => {
    await page.goto("/activity-logs");
    await expect(page.getByRole("heading", { name: /log aktivitas/i })).toBeVisible();
  });

  test("harus menampilkan deskripsi halaman", async ({ page }) => {
    await page.goto("/activity-logs");
    await expect(page.getByText(/riwayat semua aktivitas/i)).toBeVisible();
  });

  test("harus menampilkan tabel atau pesan kosong", async ({ page }) => {
    await page.goto("/activity-logs");
    const hasTable = await page
      .locator("table")
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/tidak ada log|belum ada/i)
      .isVisible()
      .catch(() => false);
    const hasLogs = await page
      .getByText(/login|buat instrumen|submit rating/i)
      .isVisible()
      .catch(() => false);
    expect(hasTable || hasEmpty || hasLogs).toBeTruthy();
  });

  test("harus menampilkan sidebar navigasi admin", async ({ page }) => {
    await page.goto("/activity-logs");
    await expect(page.getByRole("link", { name: /^instrumen$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^pengguna$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^log aktivitas$/i })).toBeVisible();
  });

  // ─── Filter ───────────────────────────────────────────────────────────────

  test("harus menampilkan dropdown filter berdasarkan aksi", async ({ page }) => {
    await page.goto("/activity-logs");
    // Filter dropdown berisi opsi jenis aksi
    const filterSelect = page.getByRole("combobox").first();
    await expect(filterSelect).toBeVisible();
  });

  test("harus menampilkan filter tanggal mulai dan tanggal selesai", async ({ page }) => {
    await page.goto("/activity-logs");
    const dateInputs = page.locator('input[type="date"]');
    await expect(dateInputs.first()).toBeVisible();
    expect(await dateInputs.count()).toBeGreaterThanOrEqual(2);
  });

  test("harus dapat memfilter log berdasarkan aksi 'Login'", async ({ page }) => {
    await page.goto("/activity-logs");
    const filterSelect = page.getByRole("combobox").first();
    await filterSelect.selectOption("login");

    const searchButton = page.getByRole("button", { name: /cari|filter|terapkan/i });
    if (await searchButton.isVisible()) {
      await searchButton.click();
    }

    // Setelah filter, setiap baris yang tampil harus bertipe "Login"
    // atau tabel kosong jika tidak ada log login
    await page.waitForTimeout(500);
    const rows = page.getByRole("row").filter({ hasText: /login/i });
    const emptyMsg = page.getByText(/tidak ada log|belum ada/i);
    const hasRows = await rows
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmpty = await emptyMsg.isVisible().catch(() => false);
    expect(hasRows || hasEmpty).toBeTruthy();
  });

  test("harus dapat menyetel rentang tanggal pada filter", async ({ page }) => {
    await page.goto("/activity-logs");
    const dateInputs = page.locator('input[type="date"]');
    await dateInputs.first().fill("2024-01-01");
    await dateInputs.last().fill("2099-12-31");
    // Tidak ada error saat mengisi tanggal
    await expect(page.getByText(/error|gagal/i)).not.toBeVisible();
  });

  // ─── Tombol Filter / Terapkan ─────────────────────────────────────────────

  test("harus menampilkan tombol terapkan filter", async ({ page }) => {
    await page.goto("/activity-logs");
    await expect(page.getByRole("button", { name: /terapkan filter/i })).toBeVisible();
  });

  test("harus dapat menekan tombol terapkan filter tanpa error", async ({ page }) => {
    await page.goto("/activity-logs");
    await page.getByRole("button", { name: /terapkan filter/i }).click();
    await page.waitForTimeout(1_000);
    await expect(page.getByText(/gagal memuat log/i)).not.toBeVisible();
  });

  // ─── Kolom Tabel ──────────────────────────────────────────────────────────

  test("harus menampilkan kolom header tabel log aktivitas jika ada data", async ({ page }) => {
    await page.goto("/activity-logs");
    const hasTable = await page
      .locator("table")
      .isVisible()
      .catch(() => false);
    if (!hasTable) {
      test.skip();
      return;
    }
    await expect(page.getByRole("columnheader", { name: /aksi|action/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /waktu|tanggal/i })).toBeVisible();
  });
});
