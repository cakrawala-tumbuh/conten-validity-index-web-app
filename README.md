# Content Validity Index Web App

Frontend web application berbasis **Next.js 15** untuk pengelolaan **Content Validity Index (CVI)**.

CVI adalah metode statistik untuk mengukur validitas isi instrumen penelitian, dengan menghitung rasio persetujuan antar-penilai (expert) terhadap item-item dalam instrumen.

## Tech Stack

| Komponen      | Teknologi                             |
| ------------- | ------------------------------------- |
| Framework     | Next.js 15 (App Router)               |
| Bahasa        | TypeScript 5+ (strict mode)           |
| Styling       | Tailwind CSS v4                       |
| Autentikasi   | NextAuth.js v4 + Authentik OIDC       |
| Validasi Form | React Hook Form + Zod                 |
| Testing Unit  | Jest + React Testing Library          |
| Testing E2E   | Playwright (via Docker)               |
| Container     | Docker (multi-stage) + Docker Compose |
| CI/CD         | GitHub Actions                        |

## Setup

### 1. Install dependensi

```bash
npm install
```

### 2. Konfigurasi environment variables

```bash
cp .env.example .env.local
# Edit .env.local dengan nilai yang sesuai
```

### 3. Jalankan development server

```bash
npm run dev
# atau via Docker:
docker compose up
```

## Autentikasi

Aplikasi menggunakan **Authentik** sebagai Identity Provider (IdP) via OIDC.

- Tidak ada form login di aplikasi — pengguna hanya klik tombol **"Masuk dengan Authentik"**
- Role dipetakan dari Authentik group membership:
  - Group `cvi-admin` → role **Admin**
  - Group `cvi-expert` → role **Expert**

## Menjalankan Test

### Unit Test (via Docker — WAJIB)

```bash
docker build -t cvi-web:test --target test .
docker compose -f docker-compose.test.yml up --abort-on-container-exit --exit-code-from test
```

### E2E Test Playwright (via Docker — WAJIB)

> **Penting:** Playwright HARUS dijalankan via Docker. Jangan gunakan `npx playwright test` langsung.

#### Test otomatis (Playwright)

```bash
# Build image lokal terlebih dahulu (jika belum)
docker build -t cvi-web:e2e --target e2e .
docker build -t cvi-backend:local ../content-validity-index-backend

# Jalankan test
docker compose -f docker-compose.playwright.yml up \
  --abort-on-container-exit --exit-code-from playwright
```

#### Stack manual (pengujian via browser)

Menjalankan seluruh stack (backend, web, Authentik) tanpa Playwright sehingga
pengujian dilakukan langsung melalui browser.

**Langkah 1 — Build image lokal** (jalankan dari masing-masing folder):

```bash
# Dari folder content-validity-index-web-app
docker build -t cvi-web:e2e --target e2e .

# Dari folder content-validity-index-backend
docker build -t cvi-backend:local .
```

**Langkah 2 — Jalankan stack:**

```bash
# Dari folder content-validity-index-web-app
docker compose -f docker-compose.e2e.yml up
```

> **Catatan:** Tunggu hingga semua service selesai start-up (±60–90 detik).
> Authentik memerlukan waktu lebih lama untuk menerapkan blueprint otomatis
> (konfigurasi OIDC, user, dan group). Cek log `authentik-worker` untuk memastikan
> blueprint sudah diterapkan sebelum mencoba login.

**Langkah 3 — Akses service:**

| Service         | URL                          |
| --------------- | ---------------------------- |
| Web App         | <http://localhost:3000>      |
| Backend         | <http://localhost:8000/docs> |
| Authentik Admin | <http://localhost:9000>      |

**Kredensial bawaan:**

| Role   | Username  | Password         |
| ------ | --------- | ---------------- |
| Admin  | `akadmin` | `AdminTest123!`  |
| Expert | `expert`  | `ExpertTest123!` |

**Langkah 4 — Bersihkan setelah selesai:**

```bash
docker compose -f docker-compose.e2e.yml down --volumes
```

## CI/CD

| Workflow             | Pemicu                    |
| -------------------- | ------------------------- |
| `lint.yml`           | Push/PR ke `master`       |
| `test.yml`           | Push/PR ke `master`       |
| `docker-publish.yml` | Push tag `v*` ke `master` |
