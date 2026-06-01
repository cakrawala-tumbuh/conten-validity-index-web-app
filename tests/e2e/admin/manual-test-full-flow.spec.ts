/**
 * Tes manual alur lengkap: pembuatan instrumen, penugasan expert, dan penilaian.
 *
 * Skenario (3 instrumen, penugasan expert berbeda-beda):
 * - Instrumen A: 3 dimensi, 7 item → expert1 + expert2
 * - Instrumen B: 2 dimensi, 5 item → expert2 + expert3
 * - Instrumen C: 3 dimensi, 7 item → expert1 + expert3
 *
 * Setup (buat instrumen, domain, item, assignment) menggunakan API langsung
 * agar tidak bergantung pada form UI yang rentan timeout.
 * Penilaian expert dan kalkulasi/ekspor CVI diuji melalui UI.
 */
import path from "path";
import { test, expect, type APIRequestContext, type Browser } from "@playwright/test";

const AUTH_DIR = process.env.PLAYWRIGHT_AUTH_DIR ?? "/tmp/cvi-playwright-auth";

const EXPERT_STATES = {
  expert1: path.join(AUTH_DIR, "expert.json"),
  expert2: path.join(AUTH_DIR, "expert2.json"),
  expert3: path.join(AUTH_DIR, "expert3.json"),
};

/** Definisi data instrumen untuk tes manual. */
const INSTRUMENTS = [
  {
    key: "A",
    name: "A - Kuesioner Kepuasan Pelanggan",
    version: "1.0",
    description: "Instrumen mengukur kepuasan pelanggan terhadap produk dan layanan.",
    dimensions: [
      {
        name: "Kualitas Produk",
        items: [
          "Produk memiliki kualitas yang sesuai dengan harga",
          "Produk bebas dari cacat dan kerusakan",
          "Produk memenuhi spesifikasi yang dijanjikan",
        ],
      },
      {
        name: "Layanan Pelanggan",
        items: [
          "Staf layanan responsif terhadap keluhan pelanggan",
          "Waktu penyelesaian masalah memuaskan",
        ],
      },
      {
        name: "Kemudahan Penggunaan",
        items: [
          "Produk mudah dioperasikan tanpa pelatihan khusus",
          "Panduan penggunaan jelas dan informatif",
        ],
      },
    ],
    expertNames: ["Expert CVI", "Expert CVI 2"],
    expertStates: ["expert1", "expert2"] as Array<keyof typeof EXPERT_STATES>,
  },
  {
    key: "B",
    name: "B - Skala Kinerja Organisasi",
    version: "1.0",
    description: "Instrumen pengukuran kinerja organisasi berbasis indikator kunci.",
    dimensions: [
      {
        name: "Produktivitas",
        items: [
          "Target produksi tercapai sesuai jadwal",
          "Efisiensi penggunaan sumber daya tinggi",
          "Output per tenaga kerja memenuhi standar",
        ],
      },
      {
        name: "Inovasi",
        items: [
          "Organisasi mendorong ide-ide baru dari karyawan",
          "Program inovasi diimplementasikan secara sistematis",
        ],
      },
    ],
    expertNames: ["Expert CVI 2", "Expert CVI 3"],
    expertStates: ["expert2", "expert3"] as Array<keyof typeof EXPERT_STATES>,
  },
  {
    key: "C",
    name: "C - Evaluasi Kompetensi Guru",
    version: "1.0",
    description: "Instrumen evaluasi kompetensi pedagogik dan profesional guru.",
    dimensions: [
      {
        name: "Kompetensi Pedagogik",
        items: [
          "Guru merancang pembelajaran yang berpusat pada siswa",
          "Guru menggunakan metode pembelajaran yang bervariasi",
          "Guru melakukan penilaian formatif secara berkala",
        ],
      },
      {
        name: "Kompetensi Profesional",
        items: [
          "Guru menguasai materi pelajaran secara mendalam",
          "Guru mengembangkan diri melalui pelatihan berkelanjutan",
        ],
      },
      {
        name: "Kompetensi Sosial",
        items: [
          "Guru berkomunikasi efektif dengan orang tua siswa",
          "Guru membangun hubungan kolaboratif dengan rekan sejawat",
        ],
      },
    ],
    expertNames: ["Expert CVI", "Expert CVI 3"],
    expertStates: ["expert1", "expert3"] as Array<keyof typeof EXPERT_STATES>,
  },
];

/** Menyimpan ID instrumen yang berhasil dibuat. */
const createdIds: Record<string, string> = {};

// ─── Helpers: setup via API ───────────────────────────────────────────────────

/**
 * Membuat instrumen beserta domain dan item-nya melalui API langsung.
 *
 * @param request - Playwright APIRequestContext (admin session).
 * @param instrument - Definisi instrumen.
 * @returns ID instrumen yang dibuat.
 */
async function createInstrumentViaAPI(
  request: APIRequestContext,
  instrument: (typeof INSTRUMENTS)[0],
): Promise<string> {
  // 1. Buat instrumen
  const instrResp = await request.post("/api/instruments", {
    data: {
      name: instrument.name,
      description: instrument.description,
      version: instrument.version,
    },
  });

  if (!instrResp.ok()) {
    const body = await instrResp.text();
    throw new Error(`Gagal buat instrumen: ${instrResp.status()} ${body}`);
  }

  const instr = await instrResp.json();
  const instrumentId: string = instr.id;
  console.log(`[setup] Instrumen "${instrument.name}" dibuat: ${instrumentId}`);

  // 2. Buat domain satu per satu
  const domainIds: string[] = [];
  for (const dim of instrument.dimensions) {
    const domResp = await request.post(`/api/instruments/${instrumentId}/domains`, {
      data: { name: dim.name },
    });
    if (!domResp.ok()) {
      const body = await domResp.text();
      throw new Error(`Gagal buat domain "${dim.name}": ${domResp.status()} ${body}`);
    }
    const dom = await domResp.json();
    domainIds.push(dom.id);
    console.log(`[setup]   Domain "${dim.name}" dibuat: ${dom.id}`);
  }

  // 3. Bulk create item dengan domain_id yang dipetakan
  const items = instrument.dimensions.flatMap((dim, dimIdx) =>
    dim.items.map((content, itemIdx) => ({
      sequence_number: dimIdx * 10 + itemIdx + 1,
      content,
      domain_id: domainIds[dimIdx],
    })),
  );

  const itemsResp = await request.post(`/api/instruments/${instrumentId}/items`, {
    data: { items },
  });
  if (!itemsResp.ok()) {
    const body = await itemsResp.text();
    throw new Error(`Gagal buat items: ${itemsResp.status()} ${body}`);
  }
  console.log(`[setup]   ${items.length} item dibuat untuk "${instrument.name}"`);

  return instrumentId;
}

/**
 * Mendapatkan user ID berdasarkan nama expert dari API.
 *
 * @param request - Playwright APIRequestContext.
 * @param expertName - Nama expert yang dicari.
 * @returns User ID atau null jika tidak ditemukan.
 */
async function getExpertIdByName(
  request: APIRequestContext,
  expertName: string,
): Promise<string | null> {
  const resp = await request.get("/api/users");
  if (!resp.ok()) return null;

  const users: Array<{ id: string; full_name: string; role: string }> = await resp.json();
  const found = users.find(
    (u) => u.role === "expert" && u.full_name.toLowerCase() === expertName.toLowerCase(),
  );
  return found?.id ?? null;
}

/**
 * Menugaskan expert ke instrumen via API.
 *
 * @param request - Playwright APIRequestContext (admin session).
 * @param instrumentId - ID instrumen.
 * @param userId - User ID expert.
 * @param expertName - Nama untuk logging.
 */
async function assignExpertViaAPI(
  request: APIRequestContext,
  instrumentId: string,
  userId: string,
  expertName: string,
): Promise<void> {
  const resp = await request.post(`/api/instruments/${instrumentId}/assignments`, {
    data: { user_id: userId },
  });
  if (!resp.ok()) {
    const body = await resp.text();
    throw new Error(`Gagal assign "${expertName}": ${resp.status()} ${body}`);
  }
  console.log(`[setup]   Expert "${expertName}" ditugaskan ke instrumen ${instrumentId}`);
}

// ─── Helpers: rating via UI ───────────────────────────────────────────────────

/**
 * Expert menilai semua item instrumen yang ditugaskan kepadanya (skor 4 semua).
 *
 * @param browser - Playwright browser.
 * @param storageState - Path ke auth state file expert.
 * @param expertLabel - Label untuk logging dan screenshot.
 */
async function expertRateAllAssignments(
  browser: Browser,
  storageState: string,
  expertLabel: string,
): Promise<void> {
  const context = await browser.newContext({ storageState });
  const page = await context.newPage();

  try {
    await page.goto("/my-assignments");
    await page.screenshot({
      path: `/tmp/manual-${expertLabel}-my-assignments.png`,
      fullPage: true,
    });

    const links = page.getByRole("link", { name: /mulai|lanjutkan/i });
    const count = await links.count();
    console.log(`[rating] ${expertLabel}: ${count} assignment ditemukan`);

    if (count === 0) {
      console.warn(`[rating] ${expertLabel}: Tidak ada assignment tersedia`);
      return;
    }

    // Kumpulkan semua URL penilaian terlebih dahulu
    const hrefs: string[] = [];
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute("href");
      if (href) hrefs.push(href);
    }

    for (const [idx, href] of hrefs.entries()) {
      await page.goto(href);

      const heading = await page.getByRole("heading").first().textContent().catch(() => href);
      console.log(`[rating] ${expertLabel}: Menilai "${heading?.trim()}"`);

      // Pilih skor 4 (Sangat Relevan) untuk semua item
      const rows = page.getByRole("row").filter({ has: page.getByRole("radio") });
      const rowCount = await rows.count();
      console.log(`[rating] ${expertLabel}: ${rowCount} item`);

      if (rowCount === 0) {
        console.warn(`[rating] ${expertLabel}: Tidak ada item — lewati`);
        continue;
      }

      for (let i = 0; i < rowCount; i++) {
        await rows.nth(i).getByRole("radio").last().click();
      }

      await page.screenshot({
        path: `/tmp/manual-${expertLabel}-rating-${idx}.png`,
        fullPage: true,
      });

      const submitBtn = page.getByRole("button", {
        name: /simpan semua penilaian|submit penilaian|kirim penilaian/i,
      });
      await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
      await submitBtn.click();

      await expect(
        page
          .getByText(/penilaian berhasil|berhasil disimpan|selesai/i)
          .or(page.getByRole("heading", { name: /penilaian saya/i }))
          .or(page.getByText(/status.*selesai/i)),
      ).toBeVisible({ timeout: 15_000 });

      console.log(`[rating] ${expertLabel}: Penilaian "${heading?.trim()}" berhasil`);
    }

    await page.screenshot({
      path: `/tmp/manual-${expertLabel}-selesai.png`,
      fullPage: true,
    });
  } finally {
    await context.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test suite
// ─────────────────────────────────────────────────────────────────────────────

test.describe.configure({ mode: "serial" });

test.describe("Tes Manual: Alur Lengkap CVI (API Setup + UI Verification)", () => {
  // ─── Setup: buat instrumen via API, lakukan penilaian via UI ─────────────

  test.beforeAll(async ({ request, browser }) => {
    // 1. Buat semua instrumen via API
    for (const instrument of INSTRUMENTS) {
      createdIds[instrument.key] = await createInstrumentViaAPI(request, instrument);
    }

    // 2. Dapatkan user ID untuk setiap expert
    const expertIds: Record<string, string | null> = {};
    const allExpertNames = [...new Set(INSTRUMENTS.flatMap((i) => i.expertNames))];
    for (const name of allExpertNames) {
      expertIds[name] = await getExpertIdByName(request, name);
      console.log(`[setup] Expert "${name}" → ID: ${expertIds[name]}`);
    }

    // 3. Tugaskan expert ke instrumen via API
    for (const instrument of INSTRUMENTS) {
      const instrumentId = createdIds[instrument.key];
      for (const expertName of instrument.expertNames) {
        const userId = expertIds[expertName];
        if (!userId) {
          console.warn(`[setup] Expert "${expertName}" tidak ditemukan — lewati`);
          continue;
        }
        await assignExpertViaAPI(request, instrumentId, userId, expertName);
      }
    }

    // 4. Setiap expert menilai instrumen yang ditugaskan via UI
    await expertRateAllAssignments(browser, EXPERT_STATES.expert1, "expert1");
    await expertRateAllAssignments(browser, EXPERT_STATES.expert2, "expert2");
    await expertRateAllAssignments(browser, EXPERT_STATES.expert3, "expert3");
  });

  // ─── Teardown: hapus semua instrumen ─────────────────────────────────────

  test.afterAll(async ({ request }) => {
    for (const instrument of INSTRUMENTS) {
      const id = createdIds[instrument.key];
      if (!id) continue;
      const resp = await request.delete(`/api/instruments/${id}`);
      const status = resp.status();
      console.log(`[teardown] Instrumen "${instrument.name}" dihapus (status: ${status})`);
    }
  });

  // ─── Test 1: verifikasi semua instrumen muncul di daftar ─────────────────

  test("semua instrumen harus muncul di halaman daftar instrumen", async ({ page }) => {
    await page.goto("/instruments");
    await page.screenshot({ path: "/tmp/manual-daftar-instrumen.png", fullPage: true });

    for (const instrument of INSTRUMENTS) {
      await expect(page.getByText(instrument.name)).toBeVisible({ timeout: 5_000 });
    }
  });

  // ─── Test 2: verifikasi expert ditugaskan per instrumen ──────────────────

  for (const instrument of INSTRUMENTS) {
    test(`"${instrument.name}" harus memiliki ${instrument.expertNames.length} expert (${instrument.expertNames.join(", ")})`, async ({
      page,
    }) => {
      const id = createdIds[instrument.key];
      await page.goto(`/instruments/${id}`);
      await page.getByRole("button", { name: /^expert\b/i }).click();

      await page.screenshot({
        path: `/tmp/manual-instrumen-${instrument.key}-expert-tab.png`,
        fullPage: true,
      });

      for (const expertName of instrument.expertNames) {
        await expect(page.getByText(expertName, { exact: true })).toBeVisible({ timeout: 5_000 });
      }

      await expect(
        page.getByText(
          new RegExp(`${instrument.expertNames.length} expert ditugaskan`, "i"),
        ),
      ).toBeVisible();
    });
  }

  // ─── Test 3: verifikasi item per dimensi ─────────────────────────────────

  for (const instrument of INSTRUMENTS) {
    const totalItems = instrument.dimensions.reduce((sum, d) => sum + d.items.length, 0);
    test(`"${instrument.name}" harus memiliki ${totalItems} item di tab Item`, async ({
      page,
    }) => {
      const id = createdIds[instrument.key];
      await page.goto(`/instruments/${id}`);
      await page.getByRole("button", { name: /^item\b/i }).click();

      await page.screenshot({
        path: `/tmp/manual-instrumen-${instrument.key}-item-tab.png`,
        fullPage: true,
      });

      // Verifikasi item pertama dari setiap dimensi terlihat
      for (const dim of instrument.dimensions) {
        await expect(page.getByText(dim.items[0])).toBeVisible({ timeout: 5_000 });
      }
    });
  }

  // ─── Test 4: verifikasi CVI dapat dihitung dan diekspor ──────────────────

  for (const instrument of INSTRUMENTS) {
    test(`"${instrument.name}" harus bisa menghitung CVI dengan ${instrument.expertNames.length} penilai`, async ({
      page,
    }) => {
      const id = createdIds[instrument.key];
      await page.goto(`/instruments/${id}`);
      await page.getByRole("button", { name: /hasil cvi/i }).click();
      await page.getByRole("button", { name: /hitung cvi/i }).click();

      // Tunggu hasil CVI muncul (S-CVI/Ave card)
      await expect(page.getByText(/s-cvi\/ave/i)).toBeVisible({ timeout: 20_000 });

      // Kartu "Expert" harus menampilkan jumlah penilai yang benar
      await expect(page.getByText("penilai", { exact: true })).toBeVisible();

      // Tombol Export Excel harus muncul
      await expect(page.getByRole("button", { name: /export excel/i })).toBeVisible();

      await page.screenshot({
        path: `/tmp/manual-instrumen-${instrument.key}-cvi-result.png`,
        fullPage: true,
      });

      console.log(`[test] CVI "${instrument.name}" berhasil dihitung`);
    });
  }

  // ─── Test 5: verifikasi export Excel berhasil diunduh ────────────────────

  test("export Excel Instrumen A harus memulai unduhan file XLSX", async ({ page }) => {
    const id = createdIds["A"];
    await page.goto(`/instruments/${id}`);
    await page.getByRole("button", { name: /hasil cvi/i }).click();
    await page.getByRole("button", { name: /hitung cvi/i }).click();

    await expect(page.getByRole("button", { name: /export excel/i })).toBeVisible({
      timeout: 20_000,
    });

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /export excel/i }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
    console.log(`[test] Download berhasil: ${download.suggestedFilename()}`);
  });
});
