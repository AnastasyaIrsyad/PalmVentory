-- ---------------------------------------------------------------------
-- 3. TABEL: pesanan_supplier
-- Menyimpan seluruh pesanan/pengiriman barang milik setiap supplier.
-- ---------------------------------------------------------------------
create table if not exists public.pesanan_supplier (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.profil_pengguna(id) on delete cascade,
  nama_supplier text,
  kode_pesanan text not null,
  nama_barang text not null,
  jumlah numeric not null default 0,
  satuan text not null default 'kg',
  status text not null default 'Diproses', -- Diproses | Dikemas | Dalam Pengiriman | Terkirim | Dibatalkan
  eta date,
  catatan text,
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now()
);

alter table public.pesanan_supplier enable row level security;

drop policy if exists "pesanan_supplier_full_access" on public.pesanan_supplier;
create policy "pesanan_supplier_full_access"
  on public.pesanan_supplier
  for all
  using (true)
  with check (true);

-- =====================================================================
-- SELESAI. Setelah skrip ini berhasil dijalankan, dashboard Karyawan
-- (Tugas Harian + Presensi Shift) dan dashboard Supplier (Kelola
-- Pesanan) akan langsung tersambung ke database secara nyata.
-- =====================================================================
