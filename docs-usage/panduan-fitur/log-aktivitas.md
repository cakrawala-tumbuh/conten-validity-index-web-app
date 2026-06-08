# Log Aktivitas

**Log Aktivitas** menampilkan riwayat aktivitas seluruh pengguna di sistem —
berguna untuk audit dan pemantauan. Menu ini hanya tersedia untuk **Admin**.

---

## Membuka Log Aktivitas

Klik menu **Log Aktivitas** di sidebar. Halaman menampilkan log terbaru dalam
tabel dengan kolom **Pengguna**, **Aksi**, dan informasi waktu. Aktivitas yang
dilakukan oleh sistem (bukan pengguna tertentu) ditandai sebagai _sistem_.

<!-- Screenshot: tabel log aktivitas dengan bar filter -->

---

## Menyaring Log

Gunakan bar filter di bagian atas:

1. **Jenis Aksi** — pilih jenis aktivitas tertentu (mis. _Update Pengguna_,
   _Nonaktifkan Pengguna_), atau biarkan **Semua aksi**.
2. **Dari Tanggal** — batas awal rentang waktu.
3. **Sampai Tanggal** — batas akhir rentang waktu.
4. Klik **Terapkan Filter**.

Bila tidak ada data yang cocok, tampil pesan _"Tidak ada log aktivitas ditemukan."_

!!! tip "Mempersempit pencarian"
Kombinasikan filter jenis aksi dengan rentang tanggal untuk menelusuri kejadian
spesifik, misalnya semua penonaktifan pengguna dalam satu bulan tertentu.

---

## Catatan

!!! note "Log bersifat read-only"
Log aktivitas hanya dapat dilihat dan disaring; entri log tidak dapat diubah
atau dihapus dari antarmuka ini.
