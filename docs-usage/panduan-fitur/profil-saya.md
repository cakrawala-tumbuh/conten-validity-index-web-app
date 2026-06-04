# Profil Saya

**Profil Saya** memungkinkan setiap pengguna — baik Admin maupun Expert —
memperbarui identitas pribadinya. Menu ini tersedia untuk semua peran.

---

## Membuka Profil

Klik menu **Profil Saya** di sidebar.

<!-- Screenshot: form Profil Saya -->

---

## Field Profil

| Field | Dapat diubah? | Keterangan |
|---|---|---|
| **Email** | Tidak | Dikelola oleh penyedia login (Authentik) |
| **Role** | Tidak | Ditentukan oleh grup Authentik |
| **Nama Lengkap** | Ya (wajib) | Nama tampilan Anda |
| **Institusi** | Ya | Mis. *Universitas Gadjah Mada* |
| **Bidang Keahlian** | Ya | Dipilih dari daftar master bidang keahlian |

---

## Memperbarui Profil

1. Ubah **Nama Lengkap**, **Institusi**, dan/atau **Bidang Keahlian**.
2. Klik **Simpan Perubahan**.

!!! note "Email dan Role bersifat read-only"
    Kedua field ini berasal dari Authentik dan tidak dapat diubah dari CVI Manager.
    Hubungi administrator bila perlu mengubahnya.

!!! tip "Lengkapi bidang keahlian Anda"
    Bagi expert, mengisi bidang keahlian membantu admin menugaskan instrumen yang
    sesuai dengan kepakaran Anda. Pilihan bidang keahlian berasal dari daftar master
    yang dikelola admin di [Bidang Keahlian](bidang-keahlian.md).
