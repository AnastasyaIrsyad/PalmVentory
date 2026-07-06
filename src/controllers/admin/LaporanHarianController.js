import { LaporanHarianModel } from "../../models/admin/LaporanHarianModel";

export const laporanHarianController = {
  // Mengambil seluruh data laporan harian (barang masuk/keluar) untuk ditampilkan di View
  fetchAllLaporan: async () => {
    try {
      return await LaporanHarianModel.getAllLaporan();
    } catch (error) {
      throw new Error(error.message || "Gagal mengambil data laporan harian.");
    }
  },

  // Dipanggil dari menu lain (Data Pengajuan, Kelola Barang) setiap kali ada
  // stok yang BERKURANG, supaya SEMUA perubahan stok tercatat sebagai satu
  // baris baru di Laporan Harian — dari sumber manapun asalnya.
  recordBarangKeluar: async (namaBarang, jumlah, sumberReferensi, stokAkhir, sumberTabel) => {
    return await LaporanHarianModel.insertLaporanKeluar(namaBarang, jumlah, sumberReferensi, stokAkhir, sumberTabel);
  },

  // Dipanggil dari menu lain setiap kali ada stok yang BERTAMBAH.
  recordBarangMasuk: async (idSku, jumlah, sumberReferensi, stokAkhir, sumberTabel) => {
    return await LaporanHarianModel.insertLaporanMasuk(idSku, jumlah, sumberReferensi, stokAkhir, sumberTabel);
  },
};
