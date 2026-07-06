import { supabase } from "../../SupabaseClient";

export const PengajuanBarangModel = {
  // 1. Mengambil semua daftar barang di gudang agar karyawan tahu sisa stok
  getAllBarangForKaryawan: async () => {
    const { data, error } = await supabase
      .from("barang")
      .select("id_sku, nama_barang, kategori, stok")
      .order("nama_barang", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // 2. Mengambil riwayat pengajuan khusus milik karyawan tertentu
  getRiwayatByKaryawan: async (namaKaryawan) => {
    const { data, error } = await supabase
      .from("pengajuan_karyawan")
      .select("*")
      .eq("nama_karyawan", namaKaryawan)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // 3. Memasukkan pengajuan baru (Barang Keluar) dengan ID INT Manual
  insertPengajuanKaryawan: async (payload) => {
    const { data, error } = await supabase
      .from("pengajuan_karyawan")
      .insert([payload])
      .select();

    if (error) throw error;
    return data;
  },
};
