import { StatusPengirimanModel } from "../../models/supplier/StatusPengirimanModel";
import { normalizeStatus } from "../../utils/pesananStatus";

export const statusPengirimanController = {
  fetchPesanan: async (supplierId, namaSupplier) => {
    try {
      const data = await StatusPengirimanModel.getPesananBySupplier(supplierId, namaSupplier);
      // Normalisasi status lama (data historis) agar tampil konsisten di UI baru
      return (data || []).map((item) => ({ ...item, status: normalizeStatus(item.status) }));
    } catch (error) {
      throw new Error(error.message || "Gagal mengambil data pesanan dari database.");
    }
  },

  // Supplier menandai barang sudah sampai -> memicu notifikasi Admin
  tandaiSampai: async (id) => {
    try {
      await StatusPengirimanModel.tandaiSampai(id);
      return { success: true, message: "Barang ditandai sudah sampai. Menunggu konfirmasi admin." };
    } catch (error) {
      throw new Error(error.message || "Gagal menandai barang sudah sampai.");
    }
  },
};
