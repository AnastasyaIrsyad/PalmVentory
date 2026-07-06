# Palmventory — Sistem Manajemen Stok & Distribusi Kelapa Sawit

Aplikasi web untuk mengelola stok gudang, pengguna, dan distribusi barang
operasional perkebunan kelapa sawit. Dibangun dengan React + Vite, Tailwind
CSS, dan Supabase sebagai backend database.

## Peran Pengguna

- **Admin / Pemilik Kebun** — kelola pengguna, kelola barang, dan laporan harian.
- **Supplier** — kelola pesanan, pantau status pengiriman, dan lihat histori pesanan.
- **Karyawan Kebun** — kelola tugas harian, presensi/shift kerja, dan lihat stok barang gudang.

## Menjalankan Proyek

```bash
npm install
npm run dev
```

## ⚠️ Setup Database (WAJIB sebelum fitur Karyawan & Supplier berfungsi)

Dashboard Admin (Kelola Barang, Manajemen Pengguna) memakai tabel Supabase
yang sudah ada sebelumnya (`barang`, `profil_pengguna`) dan **tidak perlu
setup tambahan**.

Dashboard **Karyawan** (Tugas Harian + Presensi Shift) dan **Supplier**
(Kelola Pesanan) memakai 3 tabel baru. Sebelum kedua dashboard ini bisa
menyimpan & membaca data sungguhan, jalankan skrip berikut satu kali di
**Supabase Dashboard → SQL Editor**:

```
database/schema_tambahan.sql
```

Skrip ini membuat tabel `tugas_karyawan`, `presensi_karyawan`, dan
`pesanan_supplier`, beserta kebijakan akses (RLS) yang konsisten dengan
tabel-tabel yang sudah ada. Skrip ini **tidak mengubah atau menghapus**
tabel/data yang sudah ada.

## Alur Pengajuan & Pesanan (Update Terbaru)

### 1. Karyawan &rarr; Admin (Pengajuan Barang Keluar)
1. Karyawan memilih barang di *Stok Barang Gudang* dan mengirim pengajuan (status `Pending`).
2. Admin di menu **Data Pengajuan &rarr; Pengajuan Karyawan** bisa **Setujui** atau **Tolak**.
   - Setujui: stok gudang berkurang otomatis & satu baris baru ditambahkan ke **Laporan** (barang keluar).
   - Tolak: admin wajib mengisi alasan; stok & laporan tidak disentuh.
3. Di sisi Karyawan, status ter-update otomatis (polling tiap 15 detik). Saat status `Ditolak`, karyawan bisa klik badge status untuk membuka **pop-up di tengah layar** berisi keterangan penolakan dari admin (gaya chat).

### 2. Admin &harr; Supplier (Permintaan Pasokan Barang)
Alur status pada tabel `pesanan_supplier`:

```
Menunggu Konfirmasi -> Diproses Supplier -> Dikirim -> Sampai -> Selesai
                     \-> Ditolak Supplier                     \-> Ditolak Admin
Menunggu Konfirmasi -> Dibatalkan (oleh Admin, sebelum direspon supplier)
```

1. Admin membuat permintaan baru ke supplier di **Data Pengajuan &rarr; Permintaan Barang** (status awal `Menunggu Konfirmasi`). Admin bisa **Batal** selama supplier belum merespon.
2. Supplier melihat permintaan di **Kelola Pesanan**, lalu **Terima** atau **Tolak** (wajib isi alasan).
3. Setelah diterima, supplier mengisi ETA & **Konfirmasi Kirim** (status `Dikirim`), pesanan pindah ke **Status Pengiriman**.
4. Setelah barang benar-benar tiba (proses pengiriman terjadi di dunia nyata), supplier klik **Barang Sudah Sampai** (status `Sampai`).
5. Admin mendapat notifikasi lonceng di Header. Klik notifikasi membuka **pop-up konfirmasi di tengah layar** dengan pilihan **Diterima** (stok gudang bertambah, status `Selesai`) atau **Tidak Diterima** (status `Ditolak Admin`, stok tidak berubah).

### 3. Kelola Barang (Admin)
Form input barang baru hanya bisa diisi Admin. Dropdown **Nama Barang** & **Jumlah Stok** otomatis terisi dari daftar pengiriman supplier yang **berhasil (status Selesai)** — tinggal pilih. Tersedia opsi "Isi Manual" untuk barang yang belum pernah dikirim supplier. Kolom **Keterangan** bersifat opsional.



```
src/
  View/Admin/        -> Halaman Admin (Dashboard, Kelola Barang, Manajemen Pengguna, Laporan)
  View/Supplier/      -> Halaman Supplier
  View/Karyawan/      -> Halaman Karyawan
  View/auth/          -> Login, Register, Lupa Password
  controllers/         -> Logika bisnis tiap modul (admin/karyawan/supplier)
  models/               -> Akses data Supabase tiap modul
  components/           -> Komponen UI yang dipakai ulang (Sidebar, Header, dll)
  layouts/              -> Layout halaman (MainLayout untuk dashboard, AuthLayout untuk login)
database/
  schema_tambahan.sql  -> Skrip SQL untuk tabel Karyawan & Supplier (lihat di atas)
```

## Tema Visual

Seluruh tampilan memakai tema **Burgundy & Sand**:

- Burgundy utama: `#4A151E`
- Burgundy aksen: `#8B2635`
- Sand/Gold aksen: `#DAB88B`
- Sand muda (latar kartu): `#F4EFE6`
