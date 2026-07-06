import { supabase } from "../../SupabaseClient";

export const KelolaBarangModel = {
  // Ambil semua data barang
  getAllBarang: async () => {
    const { data, error } = await supabase.from("barang").select("*");
    if (error) throw error;
    return data || [];
  },

  // Cari 1 barang berdasarkan nama LANGSUNG ke database (bukan dari cache
  // React), supaya perhitungan akumulasi stok selalu berdasarkan data
  // ter-update — bukan dari daftar yang mungkin sudah usang di browser.
  findByNamaLive: async (namaBarang) => {
    const target = (namaBarang || "").trim();
    if (!target) return null;
    const { data, error } = await supabase
      .from("barang")
      .select("*")
      .ilike("nama_barang", target)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  },

  // Ambil stok TERKINI 1 barang berdasarkan ID SKU langsung dari database,
  // dipakai untuk menghitung selisih (delta) stok secara aman saat edit.
  getStokById: async (id_sku) => {
    const { data, error } = await supabase
      .from("barang")
      .select("stok")
      .eq("id_sku", id_sku)
      .maybeSingle();
    if (error) throw error;
    return parseInt(data?.stok) || 0;
  },

  // Tambah barang baru
  insertBarang: async (barangData) => {
    const { data, error } = await supabase.from("barang").insert([barangData]);
    if (error) throw error;
    return data;
  },

  // Perbarui data barang berdasarkan ID SKU
  updateBarang: async (id_sku, updatedData) => {
    const { data, error } = await supabase
      .from("barang")
      .update(updatedData)
      .eq("id_sku", id_sku);
    if (error) throw error;
    return data;
  },

  // Hapus data barang
  deleteBarang: async (id_sku) => {
    const { data, error } = await supabase
      .from("barang")
      .delete()
      .eq("id_sku", id_sku);
    if (error) throw error;
    return data;
  },
};