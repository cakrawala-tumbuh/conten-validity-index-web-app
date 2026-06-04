# Pertanyaan yang Sering Diajukan (FAQ)

---

## Akun & Login

**Bagaimana cara masuk ke CVI Manager?**

Klik **Masuk dengan Authentik** di halaman login, lalu masukkan kredensial Anda di
halaman Authentik. CVI Manager tidak memiliki form username/kata sandi sendiri.

---

**Saya tidak punya kata sandi untuk aplikasi ini. Bagaimana?**

Itu normal. Login dikelola sepenuhnya oleh **Authentik (SSO)**. Gunakan akun
Authentik organisasi Anda. Bila belum punya, hubungi administrator.

---

**Mengapa saya tidak bisa masuk?**

Pastikan:

- Akun Authentik Anda aktif dan kredensial benar.
- Akun Anda belum dinonaktifkan di CVI Manager.
- Anda tergabung dalam grup yang sesuai (`cvi-admin` atau `cvi-expert`).

Bila masalah berlanjut, hubungi administrator.

---

**Mengapa menu yang saya lihat berbeda dari rekan saya?**

Menu menyesuaikan **peran** Anda. Admin melihat menu pengelolaan (Instrumen,
Pengguna, dll.); Expert hanya melihat **Penilaian Saya** dan **Profil Saya**.

---

## Penilaian (Expert)

**Mengapa saya tidak bisa menyimpan penilaian?**

Kemungkinan ada item berskor **1** atau **2** yang catatannya belum diisi. Skor
tersebut **wajib** disertai catatan. Lengkapi catatan yang ditandai, lalu simpan lagi.

---

**Apakah penilaian saya bisa disimpan sebagian lalu dilanjutkan?**

Bisa. Simpan kapan saja; saat membuka kembali instrumen di **Penilaian Saya**, form
otomatis terisi penilaian yang sudah ada.

---

**Skor berapa yang dianggap "relevan"?**

Hanya skor **3 (Cukup Relevan)** dan **4 (Sangat Relevan)**. Lihat
[Memahami CVI](memahami-cvi.md).

---

## Instrumen & CVI (Admin)

**Mengapa hasil CVI tidak berubah setelah expert menilai?**

CVI dihitung saat Anda menekan tombol, bukan otomatis. Klik **Hitung Ulang** di tab
**Hasil CVI** untuk memuat angka terbaru.

---

**Mengapa banyak item ditandai "Tidak Valid"?**

Bisa karena item memang kurang disepakati relevan, atau karena sebagian expert
belum menilai. Pastikan semua expert sudah menyelesaikan penilaian, lalu tinjau
rumusan item yang masih rendah. Lihat [Memahami CVI](memahami-cvi.md).

---

**Berapa expert minimal yang sebaiknya saya libatkan?**

Umumnya minimal 3 expert. Jumlah expert memengaruhi ambang validitas (0,83 untuk
3–5 expert; 0,78 untuk 6 expert atau lebih).

---

**Apakah menghapus instrumen bisa dibatalkan?**

Tidak. Menghapus instrumen turut menghapus item, dimensi, penugasan, dan
penilaiannya secara permanen.

---

## Masalah Teknis

**Halaman tidak memuat dengan benar.**

Coba langkah berikut:

1. Muat ulang halaman (`F5` atau `Ctrl+R`).
2. Bersihkan cache browser.
3. Coba browser lain (Chrome, Firefox, Edge, Safari versi terbaru).
4. Hubungi administrator bila masalah berlanjut.

---

**Bisakah CVI Manager dipasang seperti aplikasi?**

Bisa. CVI Manager adalah Progressive Web App (PWA). Di browser yang mendukung,
pilih **"Pasang aplikasi"** untuk menambahkannya ke perangkat Anda.

---

## Kontak Dukungan

Jika pertanyaan Anda tidak ada di sini, hubungi **administrator sistem** organisasi Anda.
