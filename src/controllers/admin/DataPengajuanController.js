import { DataPengajuanModel } from "../../models/admin/DataPengajuanModel";
import { manajemenPenggunaController } from "./ManajemenPenggunaController";
import { laporanHarianController } from "./LaporanHarianController";

export const dataPengajuanController = {
  // ==========================================
  // [1] PERAN ADMIN - PENGAJUAN KARYAWAN
  // ==========================================

  fetchAllPermintaan: async () => {
    try {
      return await DataPengajuanModel.getAllKaryawan();
    } catch (error) {
      throw new Error(error.message || "Gagal mengambil permintaan karyawan.");
    }
  },

  // Menyetujui pengajuan karyawan: stok berkurang, status jadi Disetujui,
  // dan satu baris baru otomatis ditambahkan ke Laporan (barang keluar).
  handleApprove: async (item) => {
    try {
      // stokAkhir = sisa stok TEPAT SETELAH pengajuan ini dikurangi, dicatat
      // sebagai snapshot historis di baris laporan (bukan stok gudang live).
      const stokAkhir = await DataPengajuanModel.kurangiStokBarang(item.nama_barang, item.jumlah);
      await DataPengajuanModel.updateStatusKaryawan(item.id, "Disetujui");
      await laporanHarianController.recordBarangKeluar(
        item.nama_barang,
        item.jumlah,
        item.id,
        stokAkhir,
        "pengajuan_karyawan",
      );

      return {
        success: true,
        message: `Pengajuan ${item.kode_permintaan} berhasil disetujui.`,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // Menolak pengajuan karyawan dengan alasan wajib diisi.
  // Tidak menyentuh stok maupun tabel laporan.
  handleReject: async (id, alasan) => {
    try {
      if (!alasan || alasan.trim() === "") {
        throw new Error("Alasan penolakan harus diisi!");
      }

      await DataPengajuanModel.updateStatusKaryawan(id, "Ditolak", alasan);

      return {
        success: true,
        message: "Pengajuan karyawan berhasil ditolak dan alasan telah disimpan.",
      };
    } catch (error) {
      throw new Error(error.message || "Gagal menolak pengajuan.");
    }
  },

  // ==========================================
  // [2] PERAN ADMIN - PESANAN KE SUPPLIER
  // ==========================================

  // Daftar akun bertipe "Supplier", dipakai untuk mengisi dropdown pemilihan
  // supplier saat admin membuat pesanan baru. Diambil lewat controller
  // Manajemen Pengguna (bukan import Model langsung) supaya View ini tetap
  // hanya bergantung pada satu controller.
  fetchSupplierAccounts: async () => {
    try {
      const users = await manajemenPenggunaController.fetchUsers();
      return (users || []).filter((u) => u.role === "Supplier");
    } catch {
      return [];
    }
  },

  fetchAllSupplierOrders: async () => {
    try {
      return await DataPengajuanModel.getAllSupplier();
    } catch (error) {
      throw new Error(error.message || "Gagal mengambil data pesanan supplier.");
    }
  },

  // Menyimpan pesanan logistik baru ke supplier (status awal: Menunggu Konfirmasi)
  // Kode Pesanan (ID) dibuat OTOMATIS oleh sistem di dalam model — admin
  // tidak pernah mengisinya secara manual di form.
  storeSupplierOrder: async (orderData) => {
    try {
      if (!orderData.nama_supplier || !orderData.nama_barang || !orderData.jumlah) {
        throw new Error("Data pesanan ke supplier belum lengkap.");
      }
      return await DataPengajuanModel.createSupplierOrder(orderData);
    } catch (error) {
      throw new Error(error.message || "Gagal mengirim pesanan ke database.");
    }
  },

  // Admin membatalkan pesanan yang dibuatnya sendiri (sebelum direspon supplier)
  cancelSupplierOrder: async (id) => {
    try {
      await DataPengajuanModel.cancelSupplierOrder(id);
      return { success: true, message: "Permintaan ke supplier berhasil dibatalkan." };
    } catch (error) {
      throw new Error(error.message || "Gagal membatalkan pesanan.");
    }
  },

  // Ambil pesanan supplier yang sudah "Sampai" (untuk notifikasi lonceng Admin)
  fetchPesananSampai: async () => {
    try {
      return await DataPengajuanModel.getPesananSampai();
    } catch {
      return [];
    }
  },

  // Admin menekan "Diterima": status -> Selesai & stok gudang bertambah
  confirmSupplierReceived: async (pesanan) => {
    try {
      const { idSku, jumlahMasuk, stokAkhir } = await DataPengajuanModel.confirmSupplierReceived(pesanan);
      await laporanHarianController.recordBarangMasuk(
        idSku,
        jumlahMasuk,
        pesanan.id,
        stokAkhir,
        "pesanan_supplier",
      );
      return {
        success: true,
        message: `Barang "${pesanan.nama_barang}" (${pesanan.jumlah} ${pesanan.satuan || ""}) diterima. Stok gudang otomatis bertambah.`,
      };
    } catch (error) {
      throw new Error(error.message || "Gagal mengkonfirmasi penerimaan barang.");
    }
  },

  // Admin menekan "Tidak Diterima": status -> Ditolak Admin, stok TIDAK bertambah
  rejectSupplierDelivery: async (pesanan, alasan) => {
    try {
      await DataPengajuanModel.rejectSupplierDelivery(pesanan, alasan);
      return {
        success: true,
        message: `Barang "${pesanan.nama_barang}" dari ${pesanan.nama_supplier || "supplier"} ditandai TIDAK DITERIMA.`,
      };
    } catch (error) {
      throw new Error(error.message || "Gagal menolak penerimaan barang.");
    }
  },

  // Daftar pengiriman supplier yang berhasil -> sumber dropdown Kelola Barang
  fetchSuccessfulDeliveries: async () => {
    try {
      return await DataPengajuanModel.getSuccessfulDeliveries();
    } catch {
      return [];
    }
  },

  // Tandai batch pengiriman sudah dimasukkan ke Kelola Barang, supaya
  // dropdown pada form berikutnya tidak menampilkannya lagi.
  markDeliveryUsed: async (id) => {
    try {
      await DataPengajuanModel.markDeliveryUsed(id);
      return { success: true };
    } catch (error) {
      throw new Error(error.message || "Gagal menandai pengiriman sebagai terpakai.");
    }
  },
};
