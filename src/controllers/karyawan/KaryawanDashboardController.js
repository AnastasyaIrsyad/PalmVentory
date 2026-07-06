import { KaryawanDashboardModel } from "../../models/karyawan/KaryawanDashboardModel";

export const karyawanDashboardController = {
  // ====== STOK BARANG (baca data nyata dari tabel "barang" milik Admin) ======
  fetchStokBarang: async () => {
    try {
      return await KaryawanDashboardModel.getAllBarang();
    } catch (error) {
      throw new Error(error.message || "Gagal mengambil data stok barang.");
    }
  },
};
