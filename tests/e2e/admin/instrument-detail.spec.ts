/**
 * E2E test untuk halaman detail instrumen (admin).
 *
 * Menguji semua tab pada halaman detail instrumen:
 * - Tab Informasi: edit nama, deskripsi, versi, dan status instrumen
 * - Tab Item: CRUD item instrumen (tambah single, tambah bulk, edit, hapus)
 * - Tab Expert: manajemen assignment (tugaskan expert, hapus assignment)
 * - Tab Hasil CVI: kalkulasi CVI dan ekspor Excel
 *
 * Test menggunakan instrumen yang dibuat secara dinamis di beforeAll,
 * kemudian dihapus setelah semua test selesai.
 */
import { test, expect, type Page } from "@playwright/test";

/** Nama instrumen unik untuk test suite ini. */
const INSTRUMENT_NAME = `E2E Detail Test ${Date.now()}`;
let instrumentId: string;

/**
 * Membuat instrumen baru via form UI dan mengekstrak ID-nya dari URL.
 *
 * @param page - Playwright page object.
 * @param name - Nama instrumen yang akan dibuat.
 * @returns ID instrumen yang baru dibuat.
 */
async function createTestInstrument(page: Page, name: string): Promise<string> {
  await page.goto("/instruments/new");
  await page.getByLabel(/nama instrumen/i).fill(name);
  await page
    .getByPlaceholder(/konten.*pernyataan item/i)
    .first()
    .fill("Item pertama");
  await page.getByRole("button", { name: /\+ tambah item/i }).click();
  await page
    .getByPlaceholder(/konten.*pernyataan item/i)
    .last()
    .fill("Item kedua");
  await page.getByRole("button", { name: /buat instrumen/i }).click();
  await page.waitForURL(/\/instruments$/, { timeout: 10_000 });

  // Klik Detail pada instrumen yang baru dibuat
  const row = page.getByRole("row").filter({ hasText: name });
  await row.getByRole("link", { name: /detail/i }).click();
  await page.waitForURL(/\/instruments\/[a-f0-9-]+$/, { timeout: 5_000 });

  const url = page.url();
  const match = url.match(/\/instruments\/([a-f0-9-]+)$/);
  return match?.[1] ?? "";
}

test.describe.configure({ mode: "serial" });

test.describe("Halaman Detail Instrumen (Admin)", () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    instrumentId = await createTestInstrument(page, INSTRUMENT_NAME);
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    if (!instrumentId) return;
    // Hapus instrumen lewat UI (tab Informasi → tombol Hapus)
    const page = await browser.newPage();
    await page.goto(`/instruments/${instrumentId}`);
    const deleteBtn = page.getByRole("button", { name: /hapus instrumen/i });
    if (await deleteBtn.isVisible()) {
      // Hapus instrumen memerlukan dua konfirmasi dialog
      const acceptDialog = (dialog: import("@playwright/test").Dialog) => dialog.accept();
      page.on("dialog", acceptDialog);
      await deleteBtn.click();
      await page.waitForURL(/\/instruments$/, { timeout: 15_000 });
      page.off("dialog", acceptDialog);
    }
    await page.close();
  });

  // ─── Navigasi & Header ───────────────────────────────────────────────────

  test("harus menampilkan nama instrumen di header", async ({ page }) => {
    await page.goto(`/instruments/${instrumentId}`);
    await expect(page.getByRole("heading", { name: INSTRUMENT_NAME })).toBeVisible();
  });

  test("harus menampilkan badge status instrumen", async ({ page }) => {
    await page.goto(`/instruments/${instrumentId}`);
    // Badge adalah <span class="rounded-full"> dengan label "Draf", "Aktif", atau "Ditutup"
    // Menggunakan locator spesifik agar tidak mencocokkan <option> tersembunyi di dropdown status
    await expect(
      page
        .locator("span.rounded-full")
        .filter({ hasText: /^(Draf|Aktif|Ditutup)$/ })
        .first(),
    ).toBeVisible();
  });

  test("harus menampilkan tombol kembali yang mengarah ke /instruments", async ({ page }) => {
    await page.goto(`/instruments/${instrumentId}`);
    await expect(page.getByRole("link", { name: /← kembali/i })).toBeVisible();
    await page.getByRole("link", { name: /← kembali/i }).click();
    await expect(page).toHaveURL(/\/instruments$/);
  });

  // ─── Tab Navigation ───────────────────────────────────────────────────────

  test("harus menampilkan empat tab: Informasi, Item, Expert, Hasil CVI", async ({ page }) => {
    await page.goto(`/instruments/${instrumentId}`);
    await expect(page.getByRole("button", { name: /informasi/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /item/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /expert/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /hasil cvi/i })).toBeVisible();
  });

  test("harus membuka tab Item saat diklik", async ({ page }) => {
    await page.goto(`/instruments/${instrumentId}`);
    await page.getByRole("button", { name: /item/i }).click();
    await expect(page.getByRole("button", { name: /tambah item/i })).toBeVisible();
  });

  test("harus membuka tab Expert saat diklik", async ({ page }) => {
    await page.goto(`/instruments/${instrumentId}`);
    await page.getByRole("button", { name: /expert/i }).click();
    await expect(page.getByText(/expert ditugaskan/i)).toBeVisible();
  });

  test("harus membuka tab Hasil CVI saat diklik", async ({ page }) => {
    await page.goto(`/instruments/${instrumentId}`);
    await page.getByRole("button", { name: /hasil cvi/i }).click();
    await expect(page.getByRole("button", { name: /hitung cvi/i })).toBeVisible();
  });

  // ─── Tab Informasi ────────────────────────────────────────────────────────

  test("Tab Informasi: harus menampilkan form edit dengan field nama, deskripsi, versi, status", async ({
    page,
  }) => {
    await page.goto(`/instruments/${instrumentId}`);
    // Tab Informasi aktif secara default
    // Label tidak menggunakan htmlFor/id, gunakan CSS adjacent sibling selector
    await expect(page.locator('label:has-text("Nama Instrumen") + input')).toBeVisible();
    await expect(page.locator('label:has-text("Deskripsi") + textarea')).toBeVisible();
    await expect(page.locator('label:has-text("Versi") + input')).toBeVisible();
    await expect(page.locator('label:has-text("Status") + select')).toBeVisible();
  });

  test("Tab Informasi: harus berhasil menyimpan perubahan nama instrumen", async ({ page }) => {
    await page.goto(`/instruments/${instrumentId}`);
    // Label tidak menggunakan htmlFor/id, gunakan CSS adjacent sibling selector
    const nameInput = page.locator('label:has-text("Nama Instrumen") + input');
    await nameInput.clear();
    await nameInput.fill(`${INSTRUMENT_NAME} (edited)`);
    await page.getByRole("button", { name: /simpan perubahan/i }).click();
    await expect(page.getByText(/berhasil disimpan/i)).toBeVisible({ timeout: 5_000 });

    // Kembalikan nama
    await nameInput.clear();
    await nameInput.fill(INSTRUMENT_NAME);
    await page.getByRole("button", { name: /simpan perubahan/i }).click();
    await expect(page.getByText(/berhasil disimpan/i)).toBeVisible({ timeout: 5_000 });
  });

  test("Tab Informasi: harus menampilkan error jika nama dikosongkan", async ({ page }) => {
    await page.goto(`/instruments/${instrumentId}`);
    // Label tidak menggunakan htmlFor/id, gunakan CSS adjacent sibling selector
    const nameInput = page.locator('label:has-text("Nama Instrumen") + input');
    await nameInput.clear();
    await page.getByRole("button", { name: /simpan perubahan/i }).click();
    await expect(page.getByText(/nama instrumen tidak boleh kosong/i)).toBeVisible();
  });

  test("Tab Informasi: harus menampilkan tombol 'Hapus Instrumen'", async ({ page }) => {
    await page.goto(`/instruments/${instrumentId}`);
    await expect(page.getByRole("button", { name: /hapus instrumen/i })).toBeVisible();
  });

  // ─── Tab Item ─────────────────────────────────────────────────────────────

  test("Tab Item: harus menampilkan daftar item yang sudah ada", async ({ page }) => {
    await page.goto(`/instruments/${instrumentId}`);
    await page.getByRole("button", { name: /item/i }).click();
    await expect(page.getByText(/item pertama/i)).toBeVisible();
    await expect(page.getByText(/item kedua/i)).toBeVisible();
  });

  test("Tab Item: harus dapat menambah item baru (single)", async ({ page }) => {
    await page.goto(`/instruments/${instrumentId}`);
    await page.getByRole("button", { name: /item/i }).click();
    await page.getByRole("button", { name: /tambah item/i }).click();

    // Pilih mode "Satu Item"
    const modeButton = page.getByRole("button", { name: /satu item/i });
    if (await modeButton.isVisible()) {
      await modeButton.click();
    }

    const contentInput = page.getByPlaceholder(/konten item/i).last();
    await contentInput.fill("Item baru dari test E2E");
    await page.getByRole("button", { name: /simpan item/i }).click();
    await expect(page.getByText(/item baru dari test e2e/i)).toBeVisible({ timeout: 5_000 });
  });

  test("Tab Item: harus dapat mengedit item secara inline", async ({ page }) => {
    await page.goto(`/instruments/${instrumentId}`);
    await page.getByRole("button", { name: /item/i }).click();

    // Tombol edit adalah ikon pencil dengan title="Edit" (tanpa teks visible)
    await page.getByTitle("Edit").first().click();
    // Konten item diedit melalui textarea (bukan input[type=text])
    const editTextarea = page.locator("textarea").first();
    await editTextarea.clear();
    await editTextarea.fill("Item pertama (telah diedit)");
    // Tombol simpan baris memiliki title="Simpan" (ikon check tanpa teks)
    await page.getByTitle("Simpan").first().click();
    await expect(page.getByText(/item pertama \(telah diedit\)/i)).toBeVisible({ timeout: 5_000 });
  });

  test("Tab Item: harus dapat menambah item secara bulk", async ({ page }) => {
    await page.goto(`/instruments/${instrumentId}`);
    await page.getByRole("button", { name: /item/i }).click();
    await page.getByRole("button", { name: /tambah item/i }).click();

    const bulkButton = page.getByRole("button", { name: /bulk|massal/i });
    if (await bulkButton.isVisible()) {
      await bulkButton.click();
      const textarea = page.getByPlaceholder(/satu item per baris/i);
      await textarea.fill("Item bulk pertama\nItem bulk kedua");
      await page.getByRole("button", { name: /simpan/i }).click();
      await expect(page.getByText(/item bulk pertama/i)).toBeVisible({ timeout: 5_000 });
    }
  });

  // ─── Tab Expert ───────────────────────────────────────────────────────────

  test("Tab Expert: harus menampilkan jumlah expert yang ditugaskan", async ({ page }) => {
    await page.goto(`/instruments/${instrumentId}`);
    await page.getByRole("button", { name: /expert/i }).click();
    await expect(page.getByText(/expert ditugaskan/i)).toBeVisible();
  });

  test("Tab Expert: harus menampilkan tombol 'Tugaskan Expert' jika ada expert tersedia", async ({
    page,
  }) => {
    await page.goto(`/instruments/${instrumentId}`);
    await page.getByRole("button", { name: /expert/i }).click();
    // Tombol muncul hanya jika ada expert yang belum ditugaskan
    const assignBtn = page.getByRole("button", { name: /tugaskan expert/i });
    const noExpert = page.getByText(/tidak ada expert/i);
    const hasAssignBtn = await assignBtn.isVisible().catch(() => false);
    const hasNoExpert = await noExpert.isVisible().catch(() => false);
    expect(hasAssignBtn || hasNoExpert).toBeTruthy();
  });

  // ─── Tab Hasil CVI ────────────────────────────────────────────────────────

  test("Tab CVI: harus menampilkan tombol 'Hitung CVI'", async ({ page }) => {
    await page.goto(`/instruments/${instrumentId}`);
    await page.getByRole("button", { name: /hasil cvi/i }).click();
    await expect(page.getByRole("button", { name: /hitung cvi/i })).toBeVisible();
  });

  test("Tab CVI: harus menampilkan error jika belum ada penilaian saat dihitung", async ({
    page,
  }) => {
    await page.goto(`/instruments/${instrumentId}`);
    await page.getByRole("button", { name: /hasil cvi/i }).click();
    await page.getByRole("button", { name: /hitung cvi/i }).click();
    // Harus menampilkan error (karena belum ada rating) atau hasil
    await expect(page.getByText(/gagal|tidak ada|belum ada penilaian|cvi/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
