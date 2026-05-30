import { defineConfig, devices } from "@playwright/test";

/**
 * Konfigurasi Playwright untuk E2E test CVI Web App.
 *
 * Playwright HARUS dijalankan di dalam Docker via `docker-compose.e2e.yml`.
 * baseURL menggunakan Docker internal network (`http://web:3000`) bukan localhost.
 * globalSetup mengotomatisasi proses login per role sebelum test dijalankan.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],

  globalSetup: "./tests/e2e/global-setup.ts",

  use: {
    /**
     * Base URL menggunakan Docker internal network.
     * Ketika dijalankan di luar Docker (lokal), gunakan PLAYWRIGHT_BASE_URL env var.
     */
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://web:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    /**
     * Setup project untuk auth state — tidak menjalankan test,
     * hanya menyiapkan storageState per role.
     */
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
    },

    /**
     * Test suite untuk role admin.
     * Menggunakan storageState yang sudah dibuat oleh global-setup.
     */
    {
      name: "admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/admin.json",
      },
      testMatch: "**/admin/**/*.spec.ts",
      dependencies: ["setup"],
    },

    /**
     * Test suite untuk role expert.
     * Menggunakan storageState yang sudah dibuat oleh global-setup.
     */
    {
      name: "expert",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/expert.json",
      },
      testMatch: "**/expert/**/*.spec.ts",
      dependencies: ["setup"],
    },

    /**
     * Test suite tanpa auth (halaman publik, login flow).
     */
    {
      name: "unauthenticated",
      use: { ...devices["Desktop Chrome"] },
      testMatch: "**/auth/**/*.spec.ts",
    },
  ],
});
