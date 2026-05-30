/**
 * Global setup untuk Playwright E2E tests.
 *
 * Melakukan login via Authentik UI untuk setiap role (admin, expert)
 * dan menyimpan `storageState` ke file JSON agar test tidak perlu
 * login ulang setiap kali.
 *
 * File ini dijalankan sekali sebelum semua test suite.
 *
 * Catatan: Authentik harus sudah dikonfigurasi dengan user test dan
 * aplikasi OIDC sebelum menjalankan setup ini.
 */
import { chromium, type FullConfig } from "@playwright/test";
import path from "path";
import fs from "fs";

const AUTHENTIK_URL = process.env.AUTHENTIK_URL ?? "http://authentik-server:9000";
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://web:3000";

const AUTH_DIR = path.join(__dirname, ".auth");

/** Konfigurasi user test per role. */
const TEST_USERS = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL ?? "admin@cvi.test",
    password: process.env.TEST_ADMIN_PASSWORD ?? "AdminTest123!",
    stateFile: path.join(AUTH_DIR, "admin.json"),
  },
  expert: {
    email: process.env.TEST_EXPERT_EMAIL ?? "expert@cvi.test",
    password: process.env.TEST_EXPERT_PASSWORD ?? "ExpertTest123!",
    stateFile: path.join(AUTH_DIR, "expert.json"),
  },
};

/**
 * Melakukan login via Authentik UI dan menyimpan session state.
 *
 * Navigasi ke halaman login aplikasi, klik tombol "Masuk dengan Authentik",
 * isi form login Authentik, dan tunggu redirect kembali ke aplikasi.
 *
 * @param config - Konfigurasi Playwright.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  // Buat direktori .auth jika belum ada
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const browser = await chromium.launch();

  for (const [role, user] of Object.entries(TEST_USERS)) {
    console.log(`[setup] Login sebagai ${role}: ${user.email}`);

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Navigasi ke halaman login aplikasi
      await page.goto(`${BASE_URL}/login`);

      // Klik tombol "Masuk dengan Authentik"
      await page.getByRole("button", { name: /masuk dengan authentik/i }).click();

      // Tunggu redirect ke Authentik
      await page.waitForURL(`${AUTHENTIK_URL}/**`, { timeout: 30_000 });

      // Isi form login Authentik
      await page.getByLabel(/email|username/i).fill(user.email);
      await page.getByLabel(/password/i).fill(user.password);
      await page.getByRole("button", { name: /sign in|login|masuk/i }).click();

      // Tunggu callback redirect kembali ke aplikasi
      await page.waitForURL(`${BASE_URL}/**`, { timeout: 30_000 });

      // Simpan session state
      await context.storageState({ path: user.stateFile });
      console.log(`[setup] Berhasil login sebagai ${role}, state disimpan ke ${user.stateFile}`);
    } catch (error) {
      console.error(`[setup] Gagal login sebagai ${role}:`, error);
      throw error;
    } finally {
      await context.close();
    }
  }

  await browser.close();
}

export default globalSetup;
