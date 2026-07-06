import { supabase } from "../../SupabaseClient";
import { PESANAN_STATUS } from "../../utils/pesananStatus";

// Model tabel "pesanan_supplier" khusus untuk menu Status Pengiriman.
// Alur status di menu ini: Dikirim -> Sampai -> Selesai / Ditolak Admin (diproses oleh Admin)
export const StatusPengirimanModel = {
  // Ambil pesanan milik supplier: cocokkan supplier_id; fallback nama_supplier.
  getPesananBySupplier: async (supplierId, namaSupplier) => {
    if (supplierId) {
      const { data, error } = await supabase
        .from("pesanan_supplier")
        .select("*")
        .eq("supplier_id", supplierId)
        .order("dibuat_pada", { ascending: false });
      if (error) throw error;
      if (data && data.length) return data;
    }
    if (namaSupplier) {
      const { data, error } = await supabase
        .from("pesanan_supplier")
        .select("*")
        .eq("nama_supplier", namaSupplier)
        .order("dibuat_pada", { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return [];
  },

  // Supplier menandai barang sudah sampai di tujuan (memicu notifikasi Admin)
  tandaiSampai: async (id) => {
    const { data, error } = await supabase
      .from("pesanan_supplier")
      .update({ status: PESANAN_STATUS.SAMPAI, diperbarui_pada: new Date().toISOString() })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data;
  },
};
