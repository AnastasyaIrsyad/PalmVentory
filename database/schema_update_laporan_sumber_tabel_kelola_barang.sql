-- ---------------------------------------------------------------------
-- UPDATE TABEL: laporan
-- Menambahkan 'kelola_barang' sebagai nilai sumber_tabel yang SAH.
--
-- GEJALA: Klik "Simpan" pada form Tambah/Edit Barang di menu Kelola
-- Barang (admin) gagal dengan pesan:
--   "Gagal Sistem: new row for relation "laporan" violates check
--    constraint "laporan_sumber_tabel_check""
--
-- PENYEBAB: Constraint laporan_sumber_tabel_check di database saat ini
-- hanya mengizinkan dua nilai untuk kolom sumber_tabel:
--   - 'pengajuan_karyawan' (barang keluar krn pengajuan karyawan disetujui)
--   - 'pesanan_supplier'   (barang masuk krn pesanan ke supplier diterima)
--
-- Padahal kode di src/controllers/admin/KelolaBarangController.js sudah
-- benar mengirim sumber_tabel = 'kelola_barang' setiap kali admin
-- menambah barang baru, mengakumulasi stok barang dengan nama yang
-- sama, atau mengubah angka stok lewat form Edit — karena ketiga aksi
-- itu SUMBER-nya memang bukan pengajuan karyawan maupun pesanan
-- supplier, melainkan input manual admin sendiri. Database menolaknya
-- karena nilai 'kelola_barang' belum termasuk daftar yang diizinkan.
--
-- PERBAIKAN: lebarkan constraint agar 'kelola_barang' ikut diizinkan,
-- tanpa menghapus dua nilai lama (supaya data laporan yang sudah ada
-- tetap valid).
-- ---------------------------------------------------------------------

alter table public.laporan
  drop constraint if exists laporan_sumber_tabel_check;

alter table public.laporan
  add constraint laporan_sumber_tabel_check
  check (sumber_tabel in ('pengajuan_karyawan', 'pesanan_supplier', 'kelola_barang'));

comment on constraint laporan_sumber_tabel_check on public.laporan is
  'Menandai asal transaksi tiap baris laporan: pengajuan_karyawan (keluar), pesanan_supplier (masuk dari supplier), atau kelola_barang (input/koreksi stok manual oleh admin).';

-- =====================================================================
-- SELESAI. Jalankan skrip ini sekali di Supabase SQL Editor (Project
-- kamu -> SQL Editor -> New query -> paste -> Run). Setelah ini, form
-- Tambah/Edit Barang di Kelola Barang akan tersimpan normal.
-- =====================================================================
