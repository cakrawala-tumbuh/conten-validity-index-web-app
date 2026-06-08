# Hasil CVI

Setelah para expert menilai item-item instrumen, Admin dapat menghitung
**Content Validity Index (CVI)** dan mengekspor hasilnya. Fitur ini berada di
tab **Hasil CVI** pada halaman detail instrumen.

!!! info "Belum paham istilahnya?"
Baca [Memahami CVI](../referensi/memahami-cvi.md) untuk penjelasan I-CVI,
S-CVI/Ave, S-CVI/UA, dan ambang validitas.

---

## Menghitung CVI

1. Buka **Instrumen** → pilih instrumen → tab **Hasil CVI**.
2. Klik tombol **Hitung CVI**.
3. Sistem menampilkan ringkasan dan tabel hasil. Untuk memperbarui setelah ada
   penilaian baru, klik **Hitung Ulang**.

<!-- Screenshot: tab Hasil CVI dengan tombol Hitung CVI dan ringkasan -->

---

## Membaca Ringkasan

Bagian atas menampilkan empat kartu ringkasan:

| Kartu          | Arti                                                                                |
| -------------- | ----------------------------------------------------------------------------------- |
| **S-CVI/Ave**  | Rata-rata seluruh I-CVI (_Average_)                                                 |
| **S-CVI/UA**   | Proporsi item yang disepakati relevan oleh **semua** expert (_Universal Agreement_) |
| **Item Valid** | Jumlah item yang memenuhi ambang validitas                                          |
| **Expert**     | Jumlah penilai yang dihitung                                                        |

---

## Tabel I-CVI per Item

Di bawah ringkasan terdapat tabel **Hasil I-CVI per Item**. Setiap baris
menampilkan nilai **I-CVI** item dan badge status:

- **Valid** — I-CVI item memenuhi ambang validitas.
- **Tidak Valid** — I-CVI item di bawah ambang; item perlu ditinjau atau direvisi.

!!! note "Ambang menyesuaikan jumlah expert"
Ambang validitas mengikuti konvensi Lynn (1986): **0,83** bila penilai
berjumlah 3–5 orang, dan **0,78** bila penilai 6 orang atau lebih.

---

## Mengekspor ke Excel

1. Setelah hasil tampil, klik tombol **Export Excel**.
2. File hasil CVI akan diunduh ke perangkat Anda (nama file mengikuti nama instrumen).

Gunakan file ini untuk dokumentasi penelitian atau analisis lanjutan.

---

## Tips & Catatan

!!! tip "Hitung ulang setelah penilaian baru"
Hasil CVI dihitung saat tombol ditekan, bukan otomatis. Setelah ada expert
yang menyelesaikan penilaian, klik **Hitung Ulang** agar angka terbaru tampil.

!!! warning "Pastikan expert sudah menilai"
CVI hanya bermakna bila item benar-benar sudah dinilai. Item tanpa penilaian
akan menghasilkan I-CVI rendah/0 dan tampak "Tidak Valid".
