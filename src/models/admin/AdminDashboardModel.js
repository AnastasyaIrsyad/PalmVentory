import { supabase } from "../../SupabaseClient";

/**
 * Model khusus Dashboard Admin.
 * Hanya membaca data dari tabel-tabel yang sudah ada (tidak mengubah skema apa pun).
 *
 * Tabel & kolom yang dipakai:
 *  - profil_pengguna  -> id, nama_lengkap, role, created_at
 *  - barang           -> stok
 *  - pengajuan_karyawan -> id, jumlah, status, created_at
 *  - pesanan_supplier -> jumlah, status, created_at   (opsional, dipakai untuk grafik "barang masuk")
 */
export const AdminDashboardModel = {
  // Semua profil pengguna (untuk Total Pengguna, Grafik Kunjungan, & Catatan Sistem)
  getAllProfiles: async () => {
    const { data, error } = await supabase
      .from("profil_pengguna")
      .select("id, nama_lengkap, role, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Semua barang (untuk akumulasi stok fisik)
  getAllBarang: async () => {
    const { data, error } = await supabase.from("barang").select("stok");
    if (error) throw error;
    return data || [];
  },

  // Semua pengajuan karyawan (untuk metrik & grafik barang keluar)
  getAllPengajuan: async () => {
    const { data, error } = await supabase
      .from("pengajuan_karyawan")
      .select("id, jumlah, status, created_at, tgl_terima");
    if (error) throw error;
    return data || [];
  },

  // Pesanan supplier (untuk grafik barang masuk). Bersifat opsional & aman bila kosong/gagal.
  getAllPesananSupplier: async () => {
    try {
      const { data, error } = await supabase
        .from("pesanan_supplier")
        .select("jumlah, status, created_at");
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },
};
