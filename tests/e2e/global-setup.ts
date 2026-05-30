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

const AUTHENTIK_URL = process.env.AUTHENTIK_URL ?? "http://localhost:9000";
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

/**
 * Direktori penyimpanan auth state (writable oleh current user).
 * Default: /tmp/cvi-playwright-auth agar tidak konflik dengan file milik root dari Docker.
 * Dapat di-override via PLAYWRIGHT_AUTH_DIR (misal: di Docker, override ke path yang sesuai).
 */
const AUTH_DIR = process.env.PLAYWRIGHT_AUTH_DIR ?? "/tmp/cvi-playwright-auth";

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function globalSetup(config: FullConfig): Promise<void> {
  // Buat direktori .auth jika belum ada
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const browser = await chromium.launch();

  for (const [role, user] of Object.entries(TEST_USERS)) {
    console.log(`[setup] Login sebagai ${role}: ${user.email}`);

    // Selalu login ulang agar token Authentik yang baru digunakan setiap kali test dijalankan.
    // Token Authentik memiliki masa berlaku terbatas; menyimpan ulang state setiap run
    // mencegah kegagalan test akibat expired access token.
    const context = await browser.newContext();

    /**
     * Proxy transparan untuk mengatasi redirect internal Authentik.
     *
     * Authentik di Docker menggunakan hostname internal "authentik-server:9000"
     * untuk redirect antar-halaman (misalnya ke /if/flow/...). Browser di host
     * tidak bisa menjangkau "authentik-server:9000" secara langsung.
     * Playwright mencegat semua request ke hostname internal tersebut dan
     * meneruskannya ke URL publik (localhost:9000) secara transparan.
     */
    await context.route(/http:\/\/authentik-server:9000/, async (route) => {
      const originalUrl = route.request().url();
      const newUrl = originalUrl.replace("http://authentik-server:9000", AUTHENTIK_URL);
      await route.continue({ url: newUrl });
    });

    const page = await context.newPage();

    try {
      // Navigasi ke halaman login aplikasi
      await page.goto(`${BASE_URL}/login`);

      // Klik tombol "Masuk dengan Authentik"
      await page.getByRole("button", { name: /masuk dengan authentik/i }).click();

      // Tunggu redirect ke Authentik (bisa ke localhost:9000 atau authentik-server:9000
      // karena Authentik menggunakan hostname internal untuk flow redirect-nya).
      // Route proxy di atas menangani request ke authentik-server:9000 secara transparan.
      await page.waitForURL(/https?:\/\/(authentik-server:9000|localhost:9000)\//, {
        timeout: 30_000,
      });
      await page.waitForLoadState("networkidle");

      // Authentik Step 1: Identification Stage
      // Field menggunakan name="uidField" (bukan label "email/username")
      await page.locator('input[name="uidField"]').fill(user.email);
      await page.getByRole("button", { name: /log in|login|continue/i }).click();

      // Tunggu Password Stage muncul (state visible, bukan hanya attached)
      const passwordInput = page.locator('input[name="password"]');
      await passwordInput.waitFor({ state: "visible", timeout: 15_000 });

      // Authentik Step 2: Password Stage
      // Klik field terlebih dahulu agar web component terinisialisasi
      await passwordInput.click();
      await page.keyboard.type(user.password);
      await page.getByRole("button", { name: /log in|login|continue/i }).click();

      // Tunggu callback redirect kembali ke aplikasi.
      // Flow "implicit-consent" Authentik auto-redirect tanpa perlu klik apapun.
      // Timeout lebih panjang untuk menampung proses consent flow.
      await page.waitForURL(`${BASE_URL}/**`, { timeout: 60_000 });

      // Simpan session state
      await context.storageState({ path: user.stateFile });
      console.log(`[setup] Berhasil login sebagai ${role}, state disimpan ke ${user.stateFile}`);
    } catch (error) {
      console.error(`[setup] Gagal login sebagai ${role}:`, error);
      // Simpan screenshot untuk debugging
      const screenshotPath = `/tmp/cvi-playwright-debug-${role}-login-failure.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
      console.log(`[setup] Screenshot disimpan ke ${screenshotPath}`);
      throw error;
    } finally {
      await context.close();
    }
  }

  await browser.close();
}

export default globalSetup;
