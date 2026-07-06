-- =====================================================================
-- UPDATE: Tambah kolom penanda "sudah_ditambahkan" pada pesanan_supplier
-- Jalankan sekali di Supabase Dashboard -> SQL Editor.
-- Tidak menghapus/mengubah data yang sudah ada.
--
-- Tujuan: setelah admin memilih satu batch pengiriman supplier (status
-- "Selesai") lewat dropdown di halaman Kelola Barang dan datanya berhasil
-- dimasukkan ke tabel `barang`, batch tersebut ditandai `sudah_ditambahkan
-- = true` supaya TIDAK muncul lagi sebagai opsi dropdown pada form
-- berikutnya (mencegah stok yang sama dihitung dua kali).
-- =====================================================================

alter table public.pesanan_supplier
  add column if not exists sudah_ditambahkan boolean not null default false;

-- =====================================================================
-- SELESAI. Setelah skrip ini dijalankan, dropdown "Nama Barang & Jumlah"
-- di form Tambah Barang Baru (Kelola Barang) hanya akan menampilkan
-- pengiriman supplier yang berhasil dan BELUM pernah dimasukkan ke
-- inventori.
-- =====================================================================
