# Mengelola Pengguna

Fitur **Pengguna** memungkinkan **Admin** melihat seluruh pengguna sistem,
melengkapi data profil mereka (institusi dan bidang keahlian), serta menonaktifkan
akun. Menu ini hanya tersedia untuk Admin.

---

## Membuka Daftar Pengguna

Klik menu **Pengguna** di sidebar. Halaman menampilkan tabel seluruh pengguna
beserta jumlah total pengguna, dengan kolom:

- **Nama**
- **Email**
- **Role** (Admin / Expert)
- **Institusi / Keahlian**
- **Status** (Aktif / Nonaktif)
- **Aksi** (Edit, Nonaktifkan)

!!! info "Pengguna dibuat otomatis saat login pertama"
Anda tidak menambah pengguna secara manual. Setiap orang yang berhasil login
melalui Authentik akan otomatis terdaftar di sistem, dengan role mengikuti
grup Authentik-nya.

<!-- Screenshot: tabel daftar pengguna -->

---

## Mengubah Data Pengguna

1. Klik ikon **Edit** pada baris pengguna.
2. Ubah **Institusi** dan/atau pilih **Bidang Keahlian** dari daftar master.
3. Klik **Simpan**.

!!! note "Email dan role tidak dapat diubah di sini"
Email dan role berasal dari Authentik. Untuk mengubahnya, lakukan di Authentik,
bukan di CVI Manager.

---

## Menonaktifkan Pengguna

1. Klik ikon **Nonaktifkan** pada baris pengguna.
2. Konfirmasi pada dialog yang muncul.

Pengguna yang dinonaktifkan **tidak dapat login lagi**. Ini adalah penonaktifan
(soft delete), bukan penghapusan permanen, sehingga riwayat dan data terkait tetap utuh.

!!! warning "Periksa penugasan aktif"
Sebelum menonaktifkan seorang expert, pastikan penugasan penilaiannya sudah
selesai atau dialihkan, agar tidak ada penilaian yang tertinggal.

---

## Kaitan dengan Fitur Lain

- Bidang keahlian yang dapat dipilih berasal dari [Bidang Keahlian](bidang-keahlian.md).
- Expert yang aktif akan muncul sebagai pilihan saat [menugaskan expert](instrumen.md#menugaskan-expert).
