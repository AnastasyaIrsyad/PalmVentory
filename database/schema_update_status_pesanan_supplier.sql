-- =====================================================================
-- UPDATE: Perbarui daftar status yang diizinkan pada pesanan_supplier
-- Jalankan sekali di Supabase Dashboard -> SQL Editor.
-- Tidak menghapus/mengubah data yang sudah ada.
-- =====================================================================

-- 1. Hapus constraint lama (nama sesuai pesan error yang muncul)
alter table public.pesanan_supplier
  drop constraint if exists chk_status_pesanan_supplier;

-- 2. (Opsional tapi disarankan) Migrasikan status lama ke status baru
--    supaya baris lama tetap valid & tampil konsisten di UI baru.
update public.pesanan_supplier set status = 'Menunggu Konfirmasi' where status = 'Diproses';
update public.pesanan_supplier set status = 'Dikirim'              where status in ('Dikemas', 'Dalam Pengiriman', 'Terkirim');
update public.pesanan_supplier set status = 'Selesai'               where status = 'Diterima';

-- 3. Buat constraint baru dengan daftar status alur terbaru
alter table public.pesanan_supplier
  add constraint chk_status_pesanan_supplier
  check (status in (
    'Menunggu Konfirmasi',
    'Diproses Supplier',
    'Ditolak Supplier',
    'Dikirim',
    'Sampai',
    'Selesai',
    'Ditolak Admin',
    'Dibatalkan'
  ));

-- 4. Set default kolom status ke status awal alur baru
alter table public.pesanan_supplier
  alter column status set default 'Menunggu Konfirmasi';

-- =====================================================================
-- SELESAI. Setelah ini, membuat/mengubah pesanan ke supplier dengan
-- status baru (Menunggu Konfirmasi, Diproses Supplier, dst.) tidak lagi
-- ditolak oleh database.
-- =====================================================================
