# Content Validity Index Web App — Copilot Instructions

> **PERHATIAN UNTUK AI:** Instruksi ini bersifat **WAJIB** dan **MENGIKAT**.
> Sebelum mengerjakan tugas apa pun, baca seluruh instruksi ini.
> Sebelum menyelesaikan tugas apa pun, verifikasi setiap item pada **Checklist Kepatuhan** di bawah.
> Melanggar instruksi ini adalah **kesalahan serius** — perbaiki segera sebelum melanjutkan.

---

## Checklist Kepatuhan — WAJIB Diverifikasi Setiap Selesai Mengerjakan Tugas

AI **HARUS** memverifikasi setiap poin berikut sebelum menyatakan suatu pekerjaan selesai.
Tandai setiap poin secara mental. Jika ada yang belum terpenuhi, **selesaikan dulu** sebelum lanjut.

### ✅ Checklist Kode

- [ ] Semua fungsi, komponen, hook, dan modul baru/diubah sudah memiliki **JSDoc comment**.
- [ ] Semua parameter fungsi dan return value sudah menggunakan **TypeScript types/interfaces** yang eksplisit.
- [ ] Tidak ada secret/credential yang di-hardcode di dalam kode — semua dari **environment variable**.
- [ ] Semua environment variable yang diekspos ke browser menggunakan prefix `NEXT_PUBLIC_`.
- [ ] Semua operasi fetch/HTTP menggunakan `async/await` — **DILARANG** menggunakan `.then().catch()` yang tidak perlu.
- [ ] Tidak ada `any` type di TypeScript — gunakan type yang spesifik atau `unknown`.
- [ ] Input dari pengguna (form, URL params) divalidasi dengan **Zod schema**.
- [ ] Tidak ada `console.log` yang tertinggal di kode production — gunakan logger yang proper.

### ✅ Checklist Testing

- [ ] Sudah ada unit test untuk setiap komponen, hook, atau fungsi baru/diubah di `tests/unit/`.
- [ ] Docker image sudah di-build ulang: `docker build -t cvi-web:test --target test .`
- [ ] **Unit test** sudah dijalankan di dalam Docker dan **semua test lolos**:
      `docker compose -f docker-compose.test.yml up --abort-on-container-exit --exit-code-from test`
- [ ] Coverage kode di `src/` tidak turun di bawah **80%**.
- [ ] Jika ada perubahan pada alur navigasi, auth, atau integrasi penuh: **E2E test Playwright**
      sudah dijalankan di dalam Docker dan **semua test lolos**:
      `docker compose -f docker-compose.playwright.yml up --abort-on-container-exit --exit-code-from playwright`
- [ ] **DILARANG** menjalankan `npx playwright test` langsung di luar Docker — semua Playwright test
      **HARUS** dijalankan via `docker-compose.playwright.yml`.

### ✅ Checklist Git

- [ ] Commit message ditulis dalam **Bahasa Indonesia**.
- [ ] Format commit mengikuti: `<tipe>(<scope>): <deskripsi singkat>`.
- [ ] Tipe commit sesuai dengan perubahan yang dilakukan (feat/fix/docs/test/refactor/chore/style/perf).
- [ ] Semua commit di lokal **WAJIB** dilakukan di branch `master`.
- [ ] Push menyesuaikan instruksi: - Jika diminta push ke master: `git push origin master`. - Jika diminta buat PR: push master lokal ke branch baru di GitHub lalu `gh pr create`.

### ✅ Checklist Docker & Keamanan

- [ ] Dockerfile menggunakan **multi-stage build** (stage `deps` + `builder` + `runner`).
- [ ] Image final tidak menyertakan file test, `.env.local`, atau credential.
- [ ] File `.env.local` tidak pernah di-commit ke repository.
- [ ] Tidak ada secret yang terekspos di client-side bundle.

---

## Ringkasan Proyek

Frontend web application berbasis **Next.js** untuk pengelolaan **Content Validity Index (CVI)**.
Aplikasi ini menyediakan antarmuka bagi peneliti untuk membuat instrumen penelitian, mengelola
penilai (expert), mengumpulkan penilaian, dan menghitung CVI secara otomatis.

CVI adalah metode statistik yang digunakan untuk mengukur validitas isi suatu instrumen penelitian,
dengan menghitung rasio persetujuan antar-penilai (expert) terhadap item-item dalam instrumen.

Aplikasi ini berkomunikasi dengan backend FastAPI melalui REST API.

## Tech Stack

| Komponen           | Teknologi                                     |
| ------------------ | --------------------------------------------- |
| Framework          | Next.js 15 (App Router)                       |
| Bahasa             | TypeScript 5+                                 |
| Styling            | Tailwind CSS v4                               |
| Komponen UI        | shadcn/ui                                     |
| Validasi Form      | React Hook Form + Zod                         |
| HTTP Client        | fetch API bawaan (dengan wrapper custom)      |
| State Management   | Zustand (global) + React Query (server state) |
| Testing Unit       | Jest + React Testing Library                  |
| Testing E2E        | Playwright                                    |
| Linter             | ESLint (eslint-config-next)                   |
| Formatter          | Prettier                                      |
| Container          | Docker + Docker Compose                       |
| CI/CD              | GitHub Actions                                |
| Container Registry | GitHub Container Registry (GHCR)              |
| CLI GitHub         | GitHub CLI (`gh`)                             |

## Struktur Proyek

```
content-validity-index-web-app/
├── .github/
│   ├── copilot-instructions.md   # file ini
│   ├── workflows/
│   │   ├── lint.yml              # linter (push/PR ke master)
│   │   ├── test.yml              # unit test (push/PR ke master)
│   │   └── docker-publish.yml   # build & push ke GHCR (tag di master)
│   └── instructions/
│       └── *.instructions.md
├── src/
│   ├── app/                      # Next.js App Router (halaman & layout)
│   │   ├── layout.tsx            # root layout
│   │   ├── page.tsx              # halaman utama
│   │   ├── (auth)/               # route group: autentikasi
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/          # route group: halaman utama aplikasi
│   │   │   ├── layout.tsx
│   │   │   ├── instruments/      # manajemen instrumen
│   │   │   ├── ratings/          # penilaian expert
│   │   │   └── reports/          # laporan & hasil CVI
│   │   └── api/                  # API Routes (jika diperlukan)
│   ├── components/               # React components
│   │   ├── ui/                   # primitive UI components (shadcn/ui)
│   │   └── features/             # komponen spesifik per fitur
│   │       ├── instruments/
│   │       ├── ratings/
│   │       └── reports/
│   ├── hooks/                    # custom React hooks
│   ├── lib/                      # utilitas dan helper
│   │   ├── api.ts                # wrapper fetch ke backend API
│   │   ├── auth.ts               # helper autentikasi
│   │   └── utils.ts              # utilitas umum
│   ├── services/                 # fungsi pemanggil REST API backend
│   │   ├── instrument-service.ts
│   │   ├── rating-service.ts
│   │   └── user-service.ts
│   ├── stores/                   # Zustand stores (global state)
│   ├── types/                    # TypeScript type & interface definitions
│   └── constants/                # konstanta aplikasi
├── tests/
│   ├── unit/                     # Jest + React Testing Library
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   └── e2e/                      # Playwright E2E tests
├── public/                       # static assets
├── .env.example                  # contoh environment variables
├── .env.local                    # env lokal (JANGAN DI-COMMIT)
├── next.config.ts                # konfigurasi Next.js
├── tailwind.config.ts            # konfigurasi Tailwind CSS
├── tsconfig.json                 # konfigurasi TypeScript
├── jest.config.ts                # konfigurasi Jest
├── jest.setup.ts                 # setup Jest (misal: @testing-library/jest-dom)
├── playwright.config.ts          # konfigurasi Playwright
├── eslint.config.mjs             # konfigurasi ESLint
├── prettier.config.mjs           # konfigurasi Prettier
├── Dockerfile                    # multi-stage Dockerfile
├── docker-compose.yml            # untuk development lokal
├── docker-compose.test.yml       # untuk menjalankan test di Docker
└── README.md
```

## Standar Kode

> **ATURAN MUTLAK:** AI **DILARANG** menulis atau mengubah kode tanpa terlebih dahulu memastikan
> semua standar di bagian ini terpenuhi. Tidak ada pengecualian.

### JSDoc Comments

**Setiap** fungsi, React component, custom hook, dan modul **WAJIB** memiliki JSDoc comment.
Ini berlaku untuk kode baru **maupun kode yang diubah** — tidak ada pengecualian.
AI **DILARANG** melewatkan JSDoc dengan alasan apapun, termasuk kode yang tampak "sederhana".

**Contoh untuk React Component:**

````tsx
/**
 * Menampilkan kartu ringkasan hasil CVI untuk satu instrumen.
 *
 * Kartu ini menampilkan nama instrumen, jumlah item, jumlah expert,
 * dan nilai S-CVI rata-rata dengan indikator warna sesuai interpretasi.
 *
 * @param props - Props komponen.
 * @param props.instrument - Data instrumen yang akan ditampilkan.
 * @param props.onViewDetail - Callback yang dipanggil saat tombol detail diklik.
 * @returns JSX element berupa kartu ringkasan instrumen.
 *
 * @example
 * ```tsx
 * <InstrumentCard
 *   instrument={instrumentData}
 *   onViewDetail={(id) => router.push(`/instruments/${id}`)}
 * />
 * ```
 */
export function InstrumentCard({ instrument, onViewDetail }: InstrumentCardProps) {
  // ...
}
````

**Contoh untuk custom hook:**

````ts
/**
 * Hook untuk mengambil dan mengelola daftar instrumen dari API.
 *
 * Menggunakan React Query di balik layar untuk caching dan refetching otomatis.
 * Data akan di-refetch setiap kali window kembali fokus.
 *
 * @param options - Opsi tambahan untuk React Query.
 * @returns Objek berisi `instruments`, `isLoading`, `isError`, dan `refetch`.
 *
 * @example
 * ```tsx
 * const { instruments, isLoading } = useInstruments();
 * ```
 */
export function useInstruments(options?: UseInstrumentsOptions) {
  // ...
}
````

**Contoh untuk fungsi utilitas:**

````ts
/**
 * Menginterpretasikan nilai CVI menjadi kategori verbal.
 *
 * Berdasarkan konvensi Lynn (1986):
 * - CVI >= 0.78: valid (jumlah expert >= 6)
 * - CVI >= 0.83: valid (jumlah expert 3-5)
 * - CVI < ambang batas: tidak valid
 *
 * @param cvi - Nilai CVI antara 0.0 dan 1.0.
 * @param nExperts - Jumlah total expert penilai.
 * @returns Kategori interpretasi: `"valid"` atau `"tidak-valid"`.
 *
 * @example
 * ```ts
 * interpretCVI(0.85, 7); // "valid"
 * interpretCVI(0.60, 7); // "tidak-valid"
 * ```
 */
export function interpretCVI(cvi: number, nExperts: number): "valid" | "tidak-valid" {
  // ...
}
````

### Gaya Kode

- **WAJIB** gunakan **TypeScript strict mode** (`"strict": true` di `tsconfig.json`).
- **DILARANG** menggunakan `any` type — gunakan `unknown` atau type yang spesifik.
- **WAJIB** gunakan **ESLint** dan **Prettier** — jalankan `npx eslint . --fix` dan `npx prettier --write .` sebelum commit.
- **WAJIB** gunakan **named export** untuk komponen — hindari `export default` kecuali untuk halaman Next.js (page.tsx, layout.tsx).
- **WAJIB** gunakan **`const`** untuk deklarasi fungsi komponen: `export const MyComponent = () => {...}`.
- **WAJIB** definisikan type Props secara eksplisit sebagai `interface` atau `type`, bukan inline.
- **WAJIB** gunakan `async/await` — **DILARANG** menggunakan `.then().catch()` berantai.
- **DILARANG** menggunakan `console.log` — gunakan `console.error` hanya untuk error yang perlu dilaporkan, dan hapus sebelum commit.

### Konvensi Komponen React

```tsx
// ✅ BENAR
interface UserProfileProps {
  userId: string;
  onUpdate: (user: User) => void;
}

/**
 * Menampilkan profil pengguna beserta form untuk memperbaruinya.
 * ...
 */
export const UserProfile = ({ userId, onUpdate }: UserProfileProps) => {
  // ...
};

// ❌ SALAH — default export, inline props, tanpa JSDoc
export default function UserProfile({ userId, onUpdate }: { userId: string; onUpdate: any }) {
  // ...
}
```

### Validasi Form

**WAJIB** gunakan kombinasi **React Hook Form + Zod** untuk semua form. Definisikan schema Zod
terpisah dari komponen.

```tsx
/**
 * Schema Zod untuk form login.
 *
 * Memvalidasi email dan password sebelum dikirim ke API.
 */
const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
```

### Pemanggilan API

**WAJIB** gunakan fungsi service di `src/services/` — **DILARANG** memanggil `fetch` langsung dari
dalam komponen atau hook.

```ts
// ✅ BENAR — panggil melalui service
import { getInstruments } from "@/services/instrument-service";

// ❌ SALAH — fetch langsung dari komponen
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/instruments`);
```

### Keamanan (OWASP Top 10)

> **PERINGATAN:** Pelanggaran keamanan adalah kesalahan kritis. AI **HARUS** memprioritaskan
> keamanan di atas segalanya dan **WAJIB** memeriksa setiap poin berikut pada setiap perubahan kode.

- **WAJIB** sanitasi semua output yang menampilkan data dari pengguna — **DILARANG** menggunakan `dangerouslySetInnerHTML` tanpa sanitasi.
- **WAJIB** simpan semua secret di environment variable — **DILARANG KERAS** hardcode API key, token, atau credential.
- **WAJIB** gunakan `NEXT_PUBLIC_` prefix **hanya** untuk variable yang memang boleh diekspos ke browser.
- **WAJIB** validasi semua input form menggunakan Zod sebelum dikirim ke API.
- **WAJIB** implementasikan CSP (Content Security Policy) di `next.config.ts`.
- **DILARANG** menyimpan token JWT di `localStorage` — gunakan `httpOnly cookie` yang dikelola server.
- **WAJIB** pastikan semua link eksternal menggunakan `rel="noopener noreferrer"`.

## Alur Testing

> **ATURAN MUTLAK:** AI **DILARANG** menyatakan suatu pekerjaan selesai sebelum test lolos
> di lingkungan Docker. Ini berlaku tanpa pengecualian untuk setiap penambahan atau perubahan kode.
> **SEMUA test — baik unit test maupun Playwright E2E — WAJIB dijalankan di dalam Docker.**

### Prinsip

Setiap kali ada **penambahan atau perubahan kode**, AI **WAJIB** menjalankan urutan berikut:

```bash
# 1. WAJIB: Build Docker image lokal (stage test)
docker build -t cvi-web:test --target test .

# 2. WAJIB: Jalankan unit test di dalam Docker
docker compose -f docker-compose.test.yml up --abort-on-container-exit --exit-code-from test
```

Jika ada perubahan pada alur navigasi, auth, atau integrasi penuh, **WAJIB** juga jalankan E2E:

```bash
# 3. WAJIB (untuk perubahan integrasi): Jalankan Playwright E2E di dalam Docker
docker compose -f docker-compose.playwright.yml up --abort-on-container-exit --exit-code-from playwright
```

> **CATATAN:** Semua perintah `docker compose` **TIDAK BOLEH** menggunakan `sudo`.
> Gunakan `docker compose` langsung (bukan `sudo docker compose`).

> **ATURAN KETAT:** `npx playwright test` **DILARANG** dijalankan langsung di luar Docker.
> Playwright **HARUS** selalu berjalan di dalam container via `docker-compose.playwright.yml`.

Jika ada test yang gagal, AI **HARUS** memperbaiki kode terlebih dahulu sebelum melanjutkan.
AI **DILARANG** melewati langkah ini dengan alasan apapun.

### Struktur Test

- `tests/unit/` — unit test komponen, hook, dan fungsi utilitas menggunakan **Jest + React Testing Library**.
  - Setiap komponen **WAJIB** diuji: render, interaksi dasar, dan edge case.
  - **WAJIB** mock semua panggilan API menggunakan `jest.mock` atau `msw` (Mock Service Worker).
- `tests/e2e/` — E2E test alur kritikal menggunakan **Playwright** yang berjalan di dalam Docker.
  - Playwright menggunakan image `mcr.microsoft.com/playwright` sebagai container dengan `network_mode: host`.
  - Playwright mengakses app dan Authentik via `localhost` (sama seperti browser pengguna manual).
  - Login flow via Authentik UI di `http://localhost:9000`.
  - `global-setup.ts` mengotomatisasi login dan menyimpan `storageState` per role.
  - **Gunakan `docker-compose.playwright.yml`** untuk menjalankan test otomatis.
  - **Gunakan `docker-compose.e2e.yml`** untuk menjalankan stack saja (pengujian manual via browser).
- Coverage minimum: **80%** untuk kode di `src/` — **TIDAK BOLEH** dikurangi.

### Penulisan Test

```tsx
/**
 * Test suite untuk komponen InstrumentCard.
 *
 * Menguji rendering, interaksi tombol, dan tampilan kondisi edge case
 * seperti nilai CVI yang sangat rendah atau tinggi.
 */
describe("InstrumentCard", () => {
  it("harus merender nama instrumen dengan benar", () => {
    // ...
  });

  it("harus memanggil onViewDetail dengan ID yang tepat saat tombol diklik", async () => {
    // ...
  });
});
```

## Alur Git

> **ATURAN MUTLAK:** AI **WAJIB** mengikuti seluruh konvensi Git di bagian ini.
> Commit message dalam bahasa selain Indonesia dan push ke `master` tanpa izin eksplisit
> adalah **pelanggaran serius** yang harus dihindari.

### Bahasa Commit

Semua commit message **WAJIB** ditulis dalam **Bahasa Indonesia** dengan format:

```
<tipe>(<scope>): <deskripsi singkat>

<penjelasan opsional yang lebih detail, jika perlu>
```

**Tipe commit yang valid:**

| Tipe       | Kapan digunakan                                            |
| ---------- | ---------------------------------------------------------- |
| `feat`     | Menambahkan fitur baru (halaman, komponen, hook baru)      |
| `fix`      | Memperbaiki bug                                            |
| `docs`     | Perubahan dokumentasi saja                                 |
| `test`     | Menambah atau mengubah test                                |
| `refactor` | Refaktor kode tanpa menambah fitur atau memperbaiki bug    |
| `chore`    | Perubahan tooling, dependensi, konfigurasi CI              |
| `style`    | Perubahan format/style (tidak mengubah logika)             |
| `perf`     | Peningkatan performa (lazy loading, optimasi bundle, dll.) |

**Contoh:**

```
feat(instruments): tambahkan halaman daftar instrumen dengan tabel dan filter

Halaman /instruments menampilkan semua instrumen milik pengguna dalam
bentuk tabel dengan fitur pencarian berdasarkan nama dan filter
berdasarkan status (draft/aktif/selesai).
```

```
fix(auth): perbaiki redirect setelah login yang mengarah ke halaman salah

Sebelumnya setelah login berhasil, pengguna diarahkan ke /dashboard
meskipun URL yang sebelumnya dituju adalah /instruments/123.
Diperbaiki dengan menyimpan intended URL di session storage.
```

### Strategi Branch

| Branch   | Deskripsi                                  |
| -------- | ------------------------------------------ |
| `master` | Branch utama, selalu stabil dan siap rilis |

- Semua commit di lokal **WAJIB** dilakukan di branch `master`.
- **DILARANG** menggunakan branch lokal selain `master`.
- Ketika push, ikuti instruksi pengguna:
  - **Jika diminta push ke master**: `git push origin master`.
  - **Jika diminta buat PR**: push dari master lokal ke branch baru di GitHub, lalu `gh pr create`.
- **WAJIB** gunakan `gh pr create` untuk membuat PR — jangan gunakan cara lain.

### Kebijakan Tagging (Semantic Versioning)

Format tag: `vMAJOR.MINOR.PATCH`

| Komponen | Kondisi naik                                                                         |
| -------- | ------------------------------------------------------------------------------------ |
| `MAJOR`  | Perubahan breaking (redesain total UI, perubahan struktur URL yang tidak kompatibel) |
| `MINOR`  | Penambahan halaman/fitur baru yang backward-compatible                               |
| `PATCH`  | Perbaikan bug, pembaruan dependensi minor, perubahan teks/styling minor              |

**Cara membuat tag:**

```bash
# Buat tag di master
git tag -a v1.2.0 -m "Rilis v1.2.0: tambahkan halaman laporan CVI"
git push origin v1.2.0

# Atau gunakan GitHub CLI
gh release create v1.2.0 --title "v1.2.0" --notes "..."
```

Tag **HARUS** selalu berada di commit di branch `master` — **DILARANG** membuat tag di branch lain.

## GitHub Actions

### Pemicu Workflow

| Workflow             | Pemicu                           |
| -------------------- | -------------------------------- |
| `lint.yml`           | Push ke `master`, PR ke `master` |
| `test.yml`           | Push ke `master`, PR ke `master` |
| `docker-publish.yml` | Push tag `v*` di `master`        |

### Interaksi dengan GitHub

**WAJIB** selalu gunakan **GitHub CLI (`gh`)** untuk semua interaksi dengan GitHub.
**DILARANG** menggunakan cara lain.

| Operasi           | Perintah yang WAJIB digunakan |
| ----------------- | ----------------------------- |
| Membuat PR        | `gh pr create`                |
| Membuat release   | `gh release create`           |
| Melihat status CI | `gh run list` / `gh run view` |
| Memeriksa PR      | `gh pr view` / `gh pr list`   |

## Docker

> **ATURAN MUTLAK:** AI **WAJIB** memastikan image Docker aman dan tidak mengandung
> informasi sensitif sebelum melakukan build atau push.

### Dockerfile — Multi-Stage Build

**WAJIB** gunakan **multi-stage build** dengan tiga stage:

1. **`deps`** — Install semua dependensi Node.js (`npm ci`).
2. **`builder`** — Build aplikasi Next.js (`npm run build`).
3. **`runner`** — Image final yang ringan; hanya menyertakan output build dan dependensi production.
4. **`test`** (opsional, untuk CI) — Stage khusus menjalankan `npm test`.

**WAJIB** gunakan `node:20-alpine` sebagai base image (bukan `node:20` yang ukurannya besar).
**DILARANG** menyertakan `node_modules` lengkap, file test, `.env.local`, atau credential di image final.
**WAJIB** jalankan aplikasi sebagai **non-root user** di image final.

### Environment Variables

**WAJIB** simpan semua konfigurasi sensitif di environment variable.
**WAJIB** gunakan `.env.example` sebagai template.
**DILARANG KERAS** commit file `.env.local` ke repository dalam kondisi apapun.

Variabel yang **TIDAK BOLEH** menggunakan prefix `NEXT_PUBLIC_` (hanya boleh diakses server-side):

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `BACKEND_API_INTERNAL_URL` (URL internal backend, bukan URL publik)

Variabel yang **BOLEH** menggunakan prefix `NEXT_PUBLIC_` (diakses client-side):

- `NEXT_PUBLIC_API_URL` (URL publik backend untuk client-side fetch)
- `NEXT_PUBLIC_APP_NAME`

## Konvensi Penamaan

| Elemen               | Konvensi                      | Contoh                                 |
| -------------------- | ----------------------------- | -------------------------------------- |
| File komponen        | PascalCase                    | `InstrumentCard.tsx`                   |
| File non-komponen    | kebab-case                    | `instrument-service.ts`, `use-cvi.ts`  |
| Direktori            | kebab-case                    | `features/instruments/`                |
| Komponen React       | PascalCase                    | `InstrumentCard`, `CVIResultTable`     |
| Fungsi/variabel      | camelCase                     | `calculateCVI`, `instrumentList`       |
| Konstanta            | UPPER_SNAKE_CASE              | `MAX_EXPERTS`, `API_TIMEOUT_MS`        |
| Interface/Type       | PascalCase                    | `InstrumentResponse`, `CVICalculation` |
| Custom hooks         | camelCase dengan prefix `use` | `useInstruments`, `useCVIReport`       |
| CSS class (Tailwind) | Tailwind utility classes      | `className="flex items-center gap-4"`  |
| URL/route            | kebab-case                    | `/instruments`, `/cvi-report`          |

## Integrasi dengan Backend

Backend REST API tersedia di `NEXT_PUBLIC_API_URL` (client) atau `BACKEND_API_INTERNAL_URL` (server).

Semua pemanggilan API **WAJIB** dilakukan melalui fungsi di `src/services/` yang menggunakan
helper `src/lib/api.ts`.

**WAJIB** tangani error API secara eksplisit — **DILARANG** membiarkan error tidak tertangani
yang menyebabkan crash aplikasi. Gunakan `try/catch` dan tampilkan pesan error yang ramah pengguna.

**WAJIB** implementasikan loading state (skeleton atau spinner) untuk setiap operasi async yang
terlihat oleh pengguna.
