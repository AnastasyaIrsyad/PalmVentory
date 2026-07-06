import { supabase } from "../../SupabaseClient";
import { PESANAN_STATUS } from "../../utils/pesananStatus";

// Model tabel "pesanan_supplier" khusus untuk menu Kelola Pesanan.
// Alur status di menu ini: Menunggu Konfirmasi -> Diproses Supplier / Ditolak Supplier -> Dikirim
export const KelolaPesananModel = {
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

  // Supplier menerima permintaan admin -> mulai menyiapkan barang
  terimaPesanan: async (id) => {
    const { data, error } = await supabase
      .from("pesanan_supplier")
      .update({ status: PESANAN_STATUS.DIPROSES_SUPPLIER, diperbarui_pada: new Date().toISOString() })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data;
  },

  // Supplier menolak permintaan admin, alasan wajib diisi
  tolakPesanan: async (id, alasan) => {
    const { data, error } = await supabase
      .from("pesanan_supplier")
      .update({
        status: PESANAN_STATUS.DITOLAK_SUPPLIER,
        alasan_penolakan: alasan,
        diperbarui_pada: new Date().toISOString(),
      })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data;
  },

  // Supplier konfirmasi kirim: isi ETA + set status "Dikirim"
  konfirmasiKirim: async (id, eta) => {
    const { data, error } = await supabase
      .from("pesanan_supplier")
      .update({ eta, status: PESANAN_STATUS.DIKIRIM, diperbarui_pada: new Date().toISOString() })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data;
  },
};
