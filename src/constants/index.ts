/**
 * Konstanta aplikasi untuk CVI Web App.
 *
 * Berisi nilai-nilai tetap yang digunakan di seluruh aplikasi,
 * termasuk konfigurasi API, threshold CVI, dan label UI.
 */

/** Jumlah item per halaman untuk pagination. */
export const PAGE_SIZE = 20;

/** Timeout default untuk request API dalam milidetik. */
export const API_TIMEOUT_MS = 30_000;

/**
 * Threshold I-CVI berdasarkan konvensi Lynn (1986).
 * Jika jumlah expert >= 6, threshold adalah 0.78.
 * Jika jumlah expert 3–5, threshold adalah 0.83.
 */
export const CVI_THRESHOLD_MANY_EXPERTS = 0.78;
export const CVI_THRESHOLD_FEW_EXPERTS = 0.83;
export const CVI_FEW_EXPERTS_MAX = 5;

/** Label status instrumen untuk tampilan UI. */
export const INSTRUMENT_STATUS_LABELS: Record<string, string> = {
  draft: "Draf",
  active: "Aktif",
  closed: "Ditutup",
};

/** Label status assignment untuk tampilan UI. */
export const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  in_progress: "Sedang Berjalan",
  completed: "Selesai",
};

/** Label role pengguna untuk tampilan UI. */
export const USER_ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  expert: "Expert",
};

/** Nama aplikasi untuk tampilan UI. */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "CVI Manager";

/**
 * Nama pendek aplikasi untuk PWA (mis. label ikon di home screen).
 * Dipakai pada field `short_name` di web app manifest.
 */
export const APP_SHORT_NAME = process.env.NEXT_PUBLIC_APP_SHORT_NAME ?? "CVI";

/**
 * Deskripsi aplikasi untuk metadata dan PWA manifest.
 * Dipakai pada `<meta name="description">` dan field `description` manifest.
 */
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ??
  "Aplikasi pengelolaan Content Validity Index (CVI) untuk instrumen penelitian.";

/**
 * Warna tema aplikasi (theme color) untuk PWA dan address bar browser mobile.
 * Selaras dengan aksen biru aplikasi (blue-600).
 */
export const APP_THEME_COLOR = process.env.NEXT_PUBLIC_APP_THEME_COLOR ?? "#2563eb";

/** Warna latar splash screen PWA saat aplikasi diluncurkan. */
export const APP_BACKGROUND_COLOR = process.env.NEXT_PUBLIC_APP_BACKGROUND_COLOR ?? "#ffffff";
