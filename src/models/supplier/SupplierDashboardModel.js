import { supabase } from "../../SupabaseClient";

// Model tabel "pesanan_supplier" khusus untuk menu Dashboard Supplier (baca saja).
export const SupplierDashboardModel = {
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
};
