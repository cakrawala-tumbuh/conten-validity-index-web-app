/**
 * Konfigurasi Prettier untuk proyek CVI Web App.
 *
 * Mengatur format kode agar konsisten di seluruh proyek.
 *
 * @type {import('prettier').Config}
 */
const config = {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  printWidth: 100,
  endOfLine: "lf",
  plugins: [],
};

export default config;
