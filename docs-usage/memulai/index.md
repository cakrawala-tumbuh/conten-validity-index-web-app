# Cara Memulai

Panduan ini membantu Anda mulai menggunakan **CVI Manager** dengan cepat.

---

## Mengakses Aplikasi

CVI Manager adalah aplikasi web yang dijalankan melalui browser:

- **URL**: alamat aplikasi yang diberikan oleh administrator organisasi Anda.
- **Browser yang didukung**: Chrome, Firefox, Edge, atau Safari versi terbaru.

!!! info "Bisa dipasang sebagai aplikasi"
    CVI Manager adalah Progressive Web App (PWA). Di browser yang mendukung,
    Anda dapat memilih **"Pasang aplikasi"** agar CVI Manager muncul seperti
    aplikasi biasa di perangkat Anda.

---

## Masuk ke Aplikasi

CVI Manager **tidak memiliki form username/kata sandi sendiri**. Login dikelola
oleh **Authentik (Single Sign-On)**.

1. Buka aplikasi di browser. Anda akan diarahkan ke halaman login.
2. Klik tombol **Masuk dengan Authentik**.
3. Masukkan kredensial Anda pada halaman Authentik, lalu setujui.
4. Anda akan kembali ke CVI Manager dalam keadaan sudah masuk.

!!! tip "Tidak punya akses?"
    Akun dan peran (role) diatur oleh administrator melalui Authentik.
    Jika tombol login gagal atau Anda tidak punya akses, hubungi administrator.

<!-- Screenshot: halaman login dengan tombol "Masuk dengan Authentik" -->

---

## Peran Pengguna

Tampilan aplikasi menyesuaikan peran Anda secara otomatis:

| Peran | Diarahkan ke | Menu yang tersedia |
|---|---|---|
| **Admin** | Daftar **Instrumen** | Instrumen, Pengguna, Bidang Keahlian, Log Aktivitas, Profil Saya |
| **Expert** | **Penilaian Saya** | Penilaian Saya, Profil Saya |

Peran ditentukan oleh keanggotaan grup di Authentik:

- Grup `cvi-admin` → peran **Admin**
- Grup `cvi-expert` → peran **Expert**

---

## Mengenal Antarmuka

Setelah masuk, Anda akan melihat tata letak dashboard yang terdiri dari:

- **Sidebar (kiri)** — menu navigasi utama sesuai peran Anda. Di layar kecil,
  sidebar muncul sebagai panel geser yang dibuka lewat tombol menu (☰).
- **Header (atas)** — menampilkan nama, email, dan peran Anda, beserta tombol
  **Keluar** untuk logout.
- **Area konten (tengah)** — isi halaman yang sedang Anda buka.

<!-- Screenshot: tampilan dashboard setelah login (sidebar + header + konten) -->

---

## Langkah Pertama yang Umum

=== "Sebagai Admin"

    1. Buka menu **Instrumen** → **+ Buat Instrumen**.
    2. Susun item dan dimensi instrumen.
    3. Tugaskan beberapa expert lewat tab **Expert**.
    4. Setelah expert selesai menilai, buka tab **Hasil CVI** untuk menghitung.

    Lihat tutorial [Membuat & Menghitung CVI](../tutorial/membuat-dan-menghitung-cvi.md).

=== "Sebagai Expert"

    1. Buka menu **Penilaian Saya**.
    2. Pilih instrumen yang ditugaskan kepada Anda.
    3. Beri skor relevansi 1–4 pada setiap item, lalu simpan.

    Lihat tutorial [Menilai Instrumen](../tutorial/menilai-instrumen.md).

---

## Langkah Berikutnya

- Pelajari semua fitur di [Panduan Fitur](../panduan-fitur/index.md).
- Pahami konsep di balik angka di [Memahami CVI](../referensi/memahami-cvi.md).
