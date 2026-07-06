import { SupplierDashboardModel } from "../../models/supplier/SupplierDashboardModel";
import { normalizeStatus } from "../../utils/pesananStatus";

export const supplierDashboardController = {
  fetchPesanan: async (supplierId, namaSupplier) => {
    try {
      const data = await SupplierDashboardModel.getPesananBySupplier(supplierId, namaSupplier);
      // Normalisasi status lama (data historis) agar tampil konsisten di UI baru
      return (data || []).map((item) => ({ ...item, status: normalizeStatus(item.status) }));
    } catch (error) {
      throw new Error(error.message || "Gagal mengambil data pesanan dari database.");
    }
  },
};
