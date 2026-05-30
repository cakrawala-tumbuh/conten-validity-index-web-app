/**
 * Konfigurasi Jest untuk CVI Web App (CommonJS — tidak membutuhkan ts-node).
 *
 * Menggunakan `nextJest` helper agar Next.js dapat memuat file konfigurasi
 * (next.config.ts, .env.local, dll.) secara otomatis saat menjalankan test.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/**
 * Konfigurasi Jest untuk proyek CVI Web App.
 *
 * Mengatur test environment jsdom untuk komponen React, path alias sesuai
 * tsconfig, threshold coverage 80%, dan hanya menjalankan test di `tests/unit/`.
 */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/tests/unit/**/*.{spec,test}.{ts,tsx}"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    // Kecualikan file-file yang tidak dapat di-unit-test di jsdom:
    "!src/**/*.d.ts",
    "!src/app/**",          // Server Components, Next.js pages/layouts
    "!src/middleware.ts",   // Next.js edge middleware
    "!src/proxy.ts",        // Next.js server-side proxy utility
    "!src/services/**",    // Thin API wrappers (no business logic)
    "!src/lib/auth.ts",    // Server-side auth (getServerSession)
    "!src/constants/**",   // Pure constants
    "!src/**/index.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = createJestConfig(config);
