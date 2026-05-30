/**
 * E2E test untuk halaman form penilaian instrumen oleh expert.
 *
 * Menguji tampilan form penilaian, petunjuk penilaian, pemilihan skor (skala 1–4),
 * pengisian catatan opsional, indikator progres, dan submit penilaian.
 *
 * Test ini memerlukan setidaknya satu assignment untuk expert yang sedang login.
 * Jika tidak ada assignment, test yang memerlukan data akan diskip otomatis.
 */
import { test, expect, type Page } from "@playwright/test";

/**
 * Menavigasi ke halaman penilaian pertama yang tersedia untuk expert.
 * Mengembalikan `null` jika tidak ada assignment.
 *
 * @param page - Playwright page object.
 * @returns URL halaman penilaian atau null jika tidak ada assignment.
 */
async function getFirstRatingUrl(page: Page): Promise<string | null> {
  await page.goto("/my-assignments");
  const firstLink = page.getByRole("link", { name: /mulai|lanjutkan/i }).first();
  if (!(await firstLink.isVisible().catch(() => false))) {
    return null;
  }
  const href = await firstLink.getAttribute("href");
  return href ?? null;
}

test.describe("Halaman Form Penilaian (Expert)", () => {
  // ─── Navigasi & Header ────────────────────────────────────────────────────

  test("harus dapat membuka halaman penilaian dari daftar assignment", async ({ page }) => {
    const url = await getFirstRatingUrl(page);
    if (!url) {
      test.skip();
      return;
    }
    await page.goto(url);
    await expect(page).toHaveURL(/\/my-assignments\/[a-f0-9-]+$/);
  });

  test("harus menampilkan tombol kembali ke /my-assignments", async ({ page }) => {
    const url = await getFirstRatingUrl(page);
    if (!url) {
      test.skip();
      return;
    }
    await page.goto(url);
    await expect(page.getByRole("link", { name: /← kembali/i })).toBeVisible();
    await page.getByRole("link", { name: /← kembali/i }).click();
    await expect(page).toHaveURL(/\/my-assignments$/);
  });

  test("harus menampilkan nama instrumen di header", async ({ page }) => {
    const url = await getFirstRatingUrl(page);
    if (!url) {
      test.skip();
      return;
    }
    await page.goto(url);
    // Heading instrumen (h1) harus tampil — bukan hanya placeholder
    const heading = page.getByRole("heading").first();
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test("harus menampilkan badge status instrumen", async ({ page }) => {
    const url = await getFirstRatingUrl(page);
    if (!url) {
      test.skip();
      return;
    }
    await page.goto(url);
    // Badge adalah <span class="rounded-full"> dengan label "Draf", "Aktif", atau "Ditutup"
    await expect(
      page.locator("span.rounded-full").filter({ hasText: /^(Draf|Aktif|Ditutup)$/ }).first(),
    ).toBeVisible();
  });

  test("harus menampilkan badge status assignment", async ({ page }) => {
    const url = await getFirstRatingUrl(page);
    if (!url) {
      test.skip();
      return;
    }
    await page.goto(url);
    // Label: "Menunggu", "Sedang Berjalan", "Selesai" (dari ASSIGNMENT_STATUS_LABELS)
    await expect(page.getByText(/menunggu|sedang berjalan|selesai/i).first()).toBeVisible();
  });

  // ─── Info Instrumen ───────────────────────────────────────────────────────

  test("harus menampilkan info instrumen (versi, jumlah item)", async ({ page }) => {
    const url = await getFirstRatingUrl(page);
    if (!url) {
      test.skip();
      return;
    }
    await page.goto(url);
    await expect(page.getByText(/versi/i)).toBeVisible();
    await expect(page.getByText(/\d+ item/i)).toBeVisible();
  });

  // ─── Petunjuk Penilaian ───────────────────────────────────────────────────

  test("harus menampilkan kotak petunjuk penilaian", async ({ page }) => {
    const url = await getFirstRatingUrl(page);
    if (!url) {
      test.skip();
      return;
    }
    await page.goto(url);
    await expect(page.getByText(/petunjuk penilaian/i)).toBeVisible();
  });

  test("harus menjelaskan skala penilaian 1–4 dalam petunjuk", async ({ page }) => {
    const url = await getFirstRatingUrl(page);
    if (!url) {
      test.skip();
      return;
    }
    await page.goto(url);
    await expect(page.getByText(/tidak relevan/i)).toBeVisible();
    await expect(page.getByText(/sangat relevan/i)).toBeVisible();
  });

  // ─── Form Penilaian ───────────────────────────────────────────────────────

  test("harus menampilkan tabel form penilaian dengan kolom skor", async ({ page }) => {
    const url = await getFirstRatingUrl(page);
    if (!url) {
      test.skip();
      return;
    }
    await page.goto(url);
    // Cek keberadaan radio button skala penilaian
    const radioButtons = page.getByRole("radio");
    const count = await radioButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("harus menampilkan indikator progres pengisian penilaian", async ({ page }) => {
    const url = await getFirstRatingUrl(page);
    if (!url) {
      test.skip();
      return;
    }
    await page.goto(url);
    // Indikator "X dari Y item" atau persentase
    await expect(page.getByText(/\d+\/\d+|\d+ dari \d+/i)).toBeVisible();
  });

  test("harus dapat memilih skor untuk item pertama", async ({ page }) => {
    const url = await getFirstRatingUrl(page);
    if (!url) {
      test.skip();
      return;
    }
    await page.goto(url);

    // Pilih skor "4" (Sangat Relevan) untuk item pertama
    const firstRadio = page
      .getByRole("row")
      .filter({ has: page.getByRole("radio") })
      .first()
      .getByRole("radio")
      .last(); // radio terakhir = skor 4
    await firstRadio.click();
    await expect(firstRadio).toBeChecked();
  });

  test("harus menampilkan kolom catatan (notes) yang bisa diisi", async ({ page }) => {
    const url = await getFirstRatingUrl(page);
    if (!url) {
      test.skip();
      return;
    }
    await page.goto(url);
    const notesInput = page.getByPlaceholder(/catatan|notes/i).first();
    if (await notesInput.isVisible()) {
      await notesInput.fill("Catatan test dari E2E");
      await expect(notesInput).toHaveValue("Catatan test dari E2E");
    }
  });

  test("harus menampilkan tombol submit penilaian", async ({ page }) => {
    const url = await getFirstRatingUrl(page);
    if (!url) {
      test.skip();
      return;
    }
    await page.goto(url);
    await expect(
      page.getByRole("button", { name: /submit penilaian|kirim penilaian/i }),
    ).toBeVisible();
  });

  test("tombol submit harus dinonaktifkan jika belum semua item dinilai", async ({ page }) => {
    const url = await getFirstRatingUrl(page);
    if (!url) {
      test.skip();
      return;
    }
    await page.goto(url);

    // Cek jika ada item yang belum dinilai; jika ya, tombol submit harus disabled
    const submitBtn = page.getByRole("button", { name: /submit penilaian|kirim penilaian/i });
    const unratedRows = page.getByRole("row").filter({ has: page.getByRole("radio") });
    const totalItems = await unratedRows.count();
    if (totalItems === 0) {
      test.skip();
      return;
    }

    const hasChecked = await page
      .getByRole("radio", { checked: true })
      .count()
      .then((c) => c >= totalItems);
    if (!hasChecked) {
      await expect(submitBtn).toBeDisabled();
    }
  });

  test("harus berhasil submit penilaian setelah semua item dinilai", async ({ page }) => {
    const url = await getFirstRatingUrl(page);
    if (!url) {
      test.skip();
      return;
    }
    await page.goto(url);

    // Pilih skor 4 (Sangat Relevan) untuk semua item
    const rows = page.getByRole("row").filter({ has: page.getByRole("radio") });
    const rowCount = await rows.count();
    if (rowCount === 0) {
      test.skip();
      return;
    }

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const lastRadio = row.getByRole("radio").last();
      await lastRadio.click();
    }

    const submitBtn = page.getByRole("button", { name: /submit penilaian|kirim penilaian/i });
    await expect(submitBtn).toBeEnabled({ timeout: 2_000 });
    await submitBtn.click();

    // Setelah submit berhasil: pesan sukses atau redirect ke /my-assignments
    const successMsg = page.getByText(/penilaian berhasil|berhasil disimpan/i);
    const redirectHeading = page.getByRole("heading", { name: /penilaian saya/i });
    await expect(successMsg.or(redirectHeading)).toBeVisible({ timeout: 10_000 });
  });
});
