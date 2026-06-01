/**
 * Simulasi pengisian form pembuatan instrumen sesuai screenshot.
 *
 * Mengisi form dengan:
 * - Nama Instrumen: "Ins #1"
 * - Deskripsi: (dikosongkan)
 * - Versi: "1.0"
 * - Dimensi: "Dim #1", "Dim #2"
 * - Item:
 *   - "Item #1.1" → Dim #1
 *   - "Item #1.2" → Dim #1
 *   - "Item #2.1" → Dim #2
 *
 * Kemudian submit dan verifikasi redirect ke /instruments.
 */
import { test, expect } from "@playwright/test";

test("simulasi pembuatan instrumen sesuai screenshot", async ({ page }) => {
  await page.goto("/instruments/new");
  await expect(page.getByRole("heading", { name: /buat instrumen baru/i })).toBeVisible();

  // ── Nama Instrumen ──────────────────────────────────────────────────────────
  await page.locator("#name").fill("Ins #1");

  // ── Versi sudah default "1.0", tidak diubah ─────────────────────────────────

  // ── Tambah Dimensi ──────────────────────────────────────────────────────────
  await page.getByRole("button", { name: /\+ tambah dimensi/i }).click();
  await page
    .getByPlaceholder(/nama dimensi/i)
    .nth(0)
    .fill("Dim #1");

  await page.getByRole("button", { name: /\+ tambah dimensi/i }).click();
  await page
    .getByPlaceholder(/nama dimensi/i)
    .nth(1)
    .fill("Dim #2");

  // ── Item 1: "Item #1.1" → Dim #1 (index 0) ─────────────────────────────────
  await page
    .getByPlaceholder(/konten.*pernyataan item/i)
    .nth(0)
    .fill("Item #1.1");
  await page.locator("select").nth(0).selectOption("0");

  // ── Tambah Item 2: "Item #1.2" → Dim #1 ────────────────────────────────────
  await page.getByRole("button", { name: /\+ tambah item/i }).click();
  await page
    .getByPlaceholder(/konten.*pernyataan item/i)
    .nth(1)
    .fill("Item #1.2");
  await page.locator("select").nth(1).selectOption("0");

  // ── Tambah Item 3: "Item #2.1" → Dim #2 ────────────────────────────────────
  await page.getByRole("button", { name: /\+ tambah item/i }).click();
  await page
    .getByPlaceholder(/konten.*pernyataan item/i)
    .nth(2)
    .fill("Item #2.1");
  await page.locator("select").nth(2).selectOption("1");

  // ── Screenshot sebelum submit ───────────────────────────────────────────────
  await page.screenshot({ path: "/tmp/before-submit-ins1.png", fullPage: true });

  // ── Submit ──────────────────────────────────────────────────────────────────
  await page.getByRole("button", { name: /buat instrumen/i }).click();

  // ── Verifikasi redirect ke /instruments ────────────────────────────────────
  await expect(page).toHaveURL(/\/instruments$/, { timeout: 15_000 });
  await expect(page.getByText(/ins #1/i)).toBeVisible();
});
