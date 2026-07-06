import { supabase } from "../../SupabaseClient";

// Model khusus Dashboard Karyawan. Membaca (read-only) tabel "barang" yang
// sama dimiliki/dikelola Admin lewat menu Kelola Barang — di sini hanya
// dipakai untuk menampilkan info stok, tidak pernah mengubah data.
export const KaryawanDashboardModel = {
  getAllBarang: async () => {
    const { data, error } = await supabase.from("barang").select("*");
    if (error) throw error;
    return data || [];
  },
};
