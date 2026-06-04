# Mengelola Instrumen

Instrumen adalah objek utama di CVI Manager — sebuah kuesioner/tes yang terdiri
dari sejumlah **item** (pernyataan) yang akan dinilai relevansinya oleh para expert.
Fitur ini hanya tersedia untuk **Admin**.

---

## Membuka Daftar Instrumen

Klik menu **Instrumen** di sidebar. Halaman menampilkan tabel semua instrumen
dengan kolom:

- **Nama** — nama instrumen.
- **Status** — **Draf**, **Aktif**, atau **Ditutup**.
- **Aksi** — tautan **Detail** untuk membuka instrumen.

<!-- Screenshot: tabel daftar instrumen dengan tombol "+ Buat Instrumen" -->

---

## Membuat Instrumen Baru

1. Di halaman **Instrumen**, klik tombol **+ Buat Instrumen**.
2. Isi field berikut:
   - **Nama Instrumen** (wajib) — mis. *WCP Survey — Workplace Characteristics Profile*.
   - **Deskripsi** (opsional) — penjelasan singkat instrumen.
   - **Versi** — default `1.0`.
3. **(Opsional) Tambahkan Dimensi/Domain.** Klik **+ Tambah Dimensi** lalu beri
   nama tiap dimensi (mis. *Kognitif*, *Afektif*). Dimensi dipakai untuk
   mengelompokkan item.
4. **Tambahkan Item.** Klik **+ Tambah Item** untuk setiap pernyataan. Isi konten
   item, dan bila sudah ada dimensi, pilih dimensi item dari dropdown.
5. Klik **Buat Instrumen**.

!!! note "Urutan pembuatan"
    Sistem menyimpan instrumen lebih dulu, lalu dimensinya, lalu item-nya. Karena
    itu dropdown dimensi pada item baru aktif hanya setelah Anda mengetik nama
    dimensi di bagian atas form.

!!! tip "Tidak harus lengkap di awal"
    Anda bisa membuat instrumen hanya dengan nama, lalu menambah item dan dimensi
    kemudian melalui halaman detail.

---

## Halaman Detail Instrumen

Dari daftar instrumen, klik **Detail**. Halaman detail tersusun dalam lima tab:

| Tab | Fungsi |
|---|---|
| **Informasi** | Ubah nama/deskripsi/versi/status instrumen, atau hapus instrumen |
| **Item** | Kelola daftar item (tambah, edit, hapus, tambah massal) |
| **Dimensi** | Kelola dimensi beserta kisi-kisi konstruk |
| **Expert** | Menugaskan dan melepas expert penilai |
| **Hasil CVI** | Menghitung dan mengekspor hasil CVI |

<!-- Screenshot: tab navigasi halaman detail instrumen -->

### Tab Informasi

Ubah **nama**, **deskripsi**, **versi**, dan **status** instrumen, lalu simpan.
Tab ini juga menyediakan aksi **hapus instrumen**.

!!! danger "Menghapus instrumen"
    Menghapus instrumen akan menghapus seluruh item, dimensi, penugasan, dan
    penilaian yang terkait. Tindakan ini tidak dapat dibatalkan.

### Tab Item

Kelola pernyataan-pernyataan yang akan dinilai expert.

- **Tambah Item** — klik **+ Tambah Item**, isi **Konten item**, pilih **Domain /
  Dimensi** (opsional), lalu **Simpan Item**.
- **Tambah Massal** — klik **Tambah Massal**, lalu tempel banyak item sekaligus
  dengan aturan **satu baris = satu item**, dan **Simpan Semua**.
- **Edit** — klik ikon edit pada baris item, ubah konten/dimensi, lalu simpan.
- **Hapus** — klik ikon hapus; sistem meminta konfirmasi karena tindakan ini
  tidak dapat dibatalkan.

### Tab Dimensi

Dimensi (domain) mengelompokkan item dan menyimpan **kisi-kisi konstruk**. Untuk
setiap dimensi Anda dapat mengisi:

- **Nama dimensi**.
- **Definisi konstruk** — penjelasan konsep yang diukur.
- **Contoh indikator perilaku** — contoh perwujudan nyata konstruk.
- **Referensi teori** — sumber/teori acuan.
- **Warna latar** — warna penanda dimensi (memakai pemilih warna). Warna ini juga
  muncul sebagai latar item terkait pada tabel penilaian expert.

Kisi-kisi konstruk ini ditampilkan kepada expert sebagai tabel acuan read-only
saat mereka menilai (lihat [Penilaian Saya](penilaian-saya.md)).

### Tab Expert

Lihat panduan khusus penugasan di bagian [Menugaskan Expert](#menugaskan-expert) di bawah.

### Tab Hasil CVI

Lihat halaman terpisah [Hasil CVI](hasil-cvi.md).

---

## Menugaskan Expert

Pada tab **Expert** di halaman detail instrumen:

1. Klik **Tugaskan Expert** (ikon tambah pengguna).
2. Pilih expert dari dropdown — hanya expert yang **belum** ditugaskan yang muncul.
3. **(Opsional)** isi **deadline** penilaian.
4. Konfirmasi untuk menyimpan penugasan.

Tabel penugasan menampilkan status tiap expert:

- **Menunggu** — expert belum mulai menilai.
- **Sedang Berjalan** — expert sudah mengisi sebagian penilaian.
- **Selesai** — expert telah menyelesaikan penilaian.

Untuk melepas penugasan, klik ikon **hapus** pada baris expert tersebut.

!!! tip "Berapa expert yang ideal?"
    Jumlah expert memengaruhi ambang validitas CVI. Lihat
    [Memahami CVI](../referensi/memahami-cvi.md) untuk penjelasan ambang
    berdasarkan jumlah penilai.

---

## Tips & Catatan

!!! tip "Susun dimensi sebelum item"
    Mendefinisikan dimensi lebih dulu memudahkan Anda mengelompokkan item saat
    menambahkannya, sekaligus melengkapi kisi-kisi konstruk untuk expert.

!!! warning "Perubahan item setelah penilaian"
    Mengubah atau menghapus item setelah expert mulai menilai dapat memengaruhi
    konsistensi hasil. Lakukan perubahan item sebelum penugasan bila memungkinkan.
