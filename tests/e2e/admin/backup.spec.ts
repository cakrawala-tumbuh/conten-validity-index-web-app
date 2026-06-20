/**
 * E2E test untuk halaman Backup & Restore (admin).
 *
 * Menguji tampilan halaman, navigasi dari sidebar, dan — yang terpenting —
 * bahwa tombol "Unduh Backup" benar-benar memicu unduhan berkas. Skenario
 * unduhan ini menjadi regression guard atas bug "tombol diklik tetapi tidak
 * terjadi apa-apa" akibat mekanisme unduhan blob yang tidak andal.
 */
import { test, expect } from "@playwright/test";

test.describe("Halaman Backup & Restore (Admin)", () => {
  // ─── Tampilan Halaman ─────────────────────────────────────────────────────

  test("harus menampilkan heading 'Backup & Restore'", async ({ page }) => {
    await page.goto("/backup");
    await expect(page.getByRole("heading", { name: /backup & restore/i })).toBeVisible();
  });

  test("harus menampilkan seksi unduh dan pulihkan", async ({ page }) => {
    await page.goto("/backup");
    await expect(page.getByRole("button", { name: /unduh backup/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /pulihkan database/i })).toBeVisible();
  });

  test("harus dapat dibuka melalui menu sidebar admin", async ({ page }) => {
    await page.goto("/users");
    await page.getByRole("link", { name: /backup & restore/i }).click();
    await expect(page).toHaveURL(/\/backup$/);
    await expect(page.getByRole("heading", { name: /backup & restore/i })).toBeVisible();
  });

  // ─── Aksi Unduh Backup ────────────────────────────────────────────────────

  test("harus memicu unduhan berkas saat tombol 'Unduh Backup' diklik", async ({ page }) => {
    await page.goto("/backup");

    // Menunggu event 'download' membuktikan bahwa anchor benar-benar memicu
    // unduhan (bukan sekadar memanggil fetch tanpa hasil).
    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    await page.getByRole("button", { name: /unduh backup/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/cvi-backup-.*\.json$/);

    // Tidak boleh ada pesan error yang muncul setelah unduhan berhasil.
    await expect(page.getByText(/gagal mengunduh backup/i)).not.toBeVisible();
  });

  // ─── Aksi Restore ─────────────────────────────────────────────────────────

  test("tombol pulihkan harus nonaktif sebelum berkas dipilih", async ({ page }) => {
    await page.goto("/backup");
    await expect(page.getByRole("button", { name: /pulihkan database/i })).toBeDisabled();
  });

  test("harus menampilkan peringatan operasi destruktif pada seksi restore", async ({ page }) => {
    await page.goto("/backup");
    await expect(page.getByText(/operasi destruktif/i)).toBeVisible();
  });
});
