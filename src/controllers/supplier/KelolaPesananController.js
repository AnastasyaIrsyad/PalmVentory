import { KelolaPesananModel } from "../../models/supplier/KelolaPesananModel";
import { normalizeStatus } from "../../utils/pesananStatus";

export const kelolaPesananController = {
  fetchPesanan: async (supplierId, namaSupplier) => {
    try {
      const data = await KelolaPesananModel.getPesananBySupplier(supplierId, namaSupplier);
      // Normalisasi status lama (data historis) agar tampil konsisten di UI baru
      return (data || []).map((item) => ({ ...item, status: normalizeStatus(item.status) }));
    } catch (error) {
      throw new Error(error.message || "Gagal mengambil data pesanan dari database.");
    }
  },

  // Supplier menerima permintaan -> mulai menyiapkan barang
  terimaPesanan: async (id) => {
    try {
      await KelolaPesananModel.terimaPesanan(id);
      return { success: true, message: "Permintaan diterima. Silakan siapkan barang untuk dikirim." };
    } catch (error) {
      throw new Error(error.message || "Gagal menerima permintaan.");
    }
  },

  // Supplier menolak permintaan, alasan wajib diisi
  tolakPesanan: async (id, alasan) => {
    if (!alasan || !alasan.trim()) {
      throw new Error("Alasan penolakan harus diisi!");
    }
    try {
      await KelolaPesananModel.tolakPesanan(id, alasan.trim());
      return { success: true, message: "Permintaan berhasil ditolak dan alasan telah dikirim ke admin." };
    } catch (error) {
      throw new Error(error.message || "Gagal menolak permintaan.");
    }
  },

  // Supplier konfirmasi kirim -> isi ETA & status Dikirim -> pindah ke Status Pengiriman
  konfirmasiKirim: async (id, eta) => {
    if (!eta) throw new Error("Pilih tanggal estimasi tiba (ETA) terlebih dahulu.");
    try {
      await KelolaPesananModel.konfirmasiKirim(id, eta);
      return { success: true, message: "Pesanan dikonfirmasi kirim. Menunggu barang sampai di tujuan." };
    } catch (error) {
      throw new Error(error.message || "Gagal mengonfirmasi pengiriman.");
    }
  },
};
