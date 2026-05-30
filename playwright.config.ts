import { defineConfig, devices } from "@playwright/test";

/**
 * Konfigurasi Playwright untuk E2E test CVI Web App.
 *
 * Untuk VS Code internal browser (Playwright Extension):
 *   baseURL default: http://localhost:3000 (pastikan app berjalan via docker-compose.yml)
 *   AUTHENTIK_URL default: http://localhost:9000
 *
 * Untuk Docker (docker-compose.e2e.yml):
 *   Set PLAYWRIGHT_BASE_URL=http://web:3000
 *   Set AUTHENTIK_URL=http://authentik-server:9000
 *
 * globalSetup mengotomatisasi login per role sebelum test dijalankan.
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
  /**
   * outputDir ke /tmp agar tidak konflik dengan file milik root yang dibuat Docker.
   * Untuk Docker, direktori ini diatur via env PLAYWRIGHT_OUTPUT_DIR.
   */
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR ?? "/tmp/cvi-playwright-results",
  reporter: [["html", { outputFolder: process.env.PLAYWRIGHT_OUTPUT_DIR
    ? `${process.env.PLAYWRIGHT_OUTPUT_DIR}/report`
    : "/tmp/cvi-playwright-report" }], ["list"]],

  globalSetup: "./tests/e2e/global-setup.ts",

  use: {
    /**
     * Base URL default: http://localhost:3000 untuk VS Code / dev lokal.
     * Saat menjalankan di Docker, gunakan PLAYWRIGHT_BASE_URL=http://web:3000.
     */
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
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
     * storageState dibuat oleh global-setup atau tersedia dari run sebelumnya.
     */
    {
      name: "admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "/tmp/cvi-playwright-auth/admin.json",
      },
      testMatch: "**/admin/**/*.spec.ts",
      dependencies: ["setup"],
    },

    /**
     * Test suite untuk role expert.
     * storageState dibuat oleh global-setup atau tersedia dari run sebelumnya.
     */
    {
      name: "expert",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "/tmp/cvi-playwright-auth/expert.json",
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
