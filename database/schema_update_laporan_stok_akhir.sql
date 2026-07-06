-- ---------------------------------------------------------------------
-- UPDATE TABEL: laporan
-- Menambahkan kolom stok_akhir agar setiap baris laporan (barang masuk
-- dari supplier / barang keluar karyawan) menyimpan SISA STOK pada saat
-- transaksi itu terjadi, bukan mengambil stok gudang yang sedang
-- berjalan (live) saat laporan dibuka.
--
-- Sebelumnya, kolom "Stok Akhir" pada halaman Laporan di-join langsung
-- ke tabel barang (stok terkini), sehingga SEMUA baris riwayat untuk
-- barang yang sama menampilkan angka yang identik (angka stok sekarang),
-- bukan angka sisa stok tepat setelah baris itu terjadi.
--
-- Contoh kasus yang diperbaiki:
--   Stok awal cangkul = 10
--   1) Karyawan A ajukan keluar 2 -> disetujui -> baris laporan #1
--      harus mencatat stok_akhir = 8
--   2) Karyawan B ajukan keluar 5 -> disetujui -> baris laporan #2
--      harus mencatat stok_akhir = 3
--   Baris #1 TIDAK boleh ikut berubah jadi 3, tetap 8 selamanya.
-- ---------------------------------------------------------------------

alter table public.laporan
  add column if not exists stok_akhir integer;

comment on column public.laporan.stok_akhir is
  'Sisa stok barang TEPAT SETELAH transaksi baris ini terjadi (snapshot historis, bukan stok live).';

-- Opsional: isi ulang data lama yang sudah pernah ada dengan asumsi stok
-- terkini (karena riwayat perhitungan lamanya tidak tersimpan). Baris-baris
-- BARU setelah update aplikasi ini akan otomatis terisi dengan benar oleh
-- aplikasi saat proses approve pengajuan / konfirmasi barang sampai.
update public.laporan l
set stok_akhir = b.stok
from public.barang b
where l.id_sku = b.id_sku
  and l.stok_akhir is null;
