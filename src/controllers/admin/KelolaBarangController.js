import { KelolaBarangModel } from "../../models/admin/KelolaBarangModel";
import { dataPengajuanController } from "./DataPengajuanController";
import { laporanHarianController } from "./LaporanHarianController";

// Buat ID SKU baru yang aman dari bentrok (unique constraint) di database.
// Sebelumnya ID dibuat dari "jumlah baris saat ini + 1", yang bisa bentrok
// dengan id_sku yang sudah ada begitu ada barang yang pernah dihapus
// (mis. list tersisa 2 baris tapi id_sku tertinggi yang pernah dipakai
// adalah BRG03) -> insert baru ditolak Supabase karena id_sku sudah
// terpakai, dan gagal tanpa keterangan yang jelas ke admin.
// Solusi: cari angka terbesar dari SEMUA id_sku berpola "BRG##" yang ada,
// lalu +1. Jadi selalu unik walau sudah ada barang yang dihapus sebelumnya.
const generateNextSku = (barangList) => {
  const maxNum = (barangList || []).reduce((max, item) => {
    const match = /^BRG(\d+)$/i.exec(item?.id_sku || "");
    if (!match) return max;
    const num = parseInt(match[1], 10);
    return Number.isFinite(num) && num > max ? num : max;
  }, 0);
  return `BRG${String(maxNum + 1).padStart(2, "0")}`;
};

export const kelolaBarangController = {
  // Ambil list barang
  fetchBarangList: async () => {
    try {
      return await KelolaBarangModel.getAllBarang();
    } catch (error) {
      throw new Error(error.message || "Gagal mengambil data dari database cloud.");
    }
  },

  // Cari barang yang sudah ada di database dengan nama yang SAMA, tanpa
  // memandang huruf besar/kecil maupun spasi di awal/akhir. Dipakai supaya
  // barang dengan nama sama tidak membuat baris duplikat, melainkan
  // stok fisiknya diakumulasikan (dijumlahkan) ke baris yang sudah ada.
  findBarangByNama: (barangList, namaBarang) => {
    const target = (namaBarang || "").trim().toLowerCase();
    if (!target) return null;
    return (barangList || []).find(
      (item) => (item?.nama_barang || "").trim().toLowerCase() === target,
    ) || null;
  },

  // Simpan data barang (Tambah Baru atau Edit)
  handleSaveBarang: async (formData, isEditing, barangList) => {
    if (!formData.nama_barang || formData.stok === "" || !formData.lokasi_penyimpanan) {
      throw new Error("Mohon isi semua kolom utama yang tersedia!");
    }
    
    const stokAngka = parseInt(formData.stok);
    if (stokAngka < 0) {
      throw new Error("Jumlah stok barang tidak boleh minus!");
    }

    const payload = {
      nama_barang: formData.nama_barang,
      kategori: formData.kategori,
      stok: stokAngka,
      lokasi_penyimpanan: formData.lokasi_penyimpanan,
      keterangan: formData.keterangan,
    };

    if (isEditing) {
      try {
        // Ambil stok LAMA langsung dari database (bukan dari barangList di
        // browser yang bisa saja sudah usang), supaya selisih (delta) yang
        // dicatat ke Laporan Harian selalu akurat walau ada aksi lain yang
        // baru saja mengubah stok barang ini.
        const stokSebelum = await KelolaBarangModel.getStokById(formData.id_sku);

        await KelolaBarangModel.updateBarang(formData.id_sku, payload);

        const delta = stokAngka - stokSebelum;
        if (delta !== 0) {
          if (delta > 0) {
            await laporanHarianController.recordBarangMasuk(
              formData.id_sku,
              delta,
              null,
              stokAngka,
              "kelola_barang",
            );
          } else {
            await laporanHarianController.recordBarangKeluar(
              formData.nama_barang,
              Math.abs(delta),
              null,
              stokAngka,
              "kelola_barang",
            );
          }
        }

        return { success: true, message: "DATA BARANG BERHASIL DIPERBARUI!" };
      } catch (error) {
        throw new Error(error.message || "Gagal memperbarui data barang!");
      }
    } else {
      // Cek dulu apakah nama barang ini SUDAH ADA di database — query
      // LANGSUNG ke database (bukan dari barangList di browser), supaya
      // tidak salah anggap "belum ada" gara-gara daftar di browser belum
      // sempat ter-refresh (mis. dua aksi Kelola Barang dilakukan berturut-
      // turut dengan cepat). Ini mencegah barang yang SAMA berakhir jadi
      // baris/ID SKU ganda dengan stok yang ke-reset, bukan terakumulasi.
      const existing = await KelolaBarangModel.findByNamaLive(formData.nama_barang);

      if (existing) {
        const stokBaru = (parseInt(existing.stok) || 0) + stokAngka;
        try {
          await KelolaBarangModel.updateBarang(existing.id_sku, { stok: stokBaru });
          await laporanHarianController.recordBarangMasuk(
            existing.id_sku,
            stokAngka,
            null,
            stokBaru,
            "kelola_barang",
          );
          return {
            success: true,
            message: `NAMA BARANG "${existing.nama_barang}" SUDAH ADA — STOK DIAKUMULASI (+${stokAngka}). TOTAL STOK SEKARANG: ${stokBaru}.`,
          };
        } catch (error) {
          throw new Error(error.message || "Gagal mengakumulasi stok barang!");
        }
      }

      // Belum ada -> ID SKU baru dijamin unik & langsung aktif -> otomatis
      // tampil di tabel "Daftar Inventori Aktif (Live Database)" setelah tersimpan.
      // ID tetap dihasilkan dari barangList terbaru yang dikirim View (sudah
      // di-refresh setelah setiap penyimpanan) untuk menghindari nomor SKU bentrok.
      const nextId = generateNextSku(barangList);
      try {
        await KelolaBarangModel.insertBarang({ id_sku: nextId, ...payload });
        if (stokAngka > 0) {
          await laporanHarianController.recordBarangMasuk(
            nextId,
            stokAngka,
            null,
            stokAngka,
            "kelola_barang",
          );
        }
        return { success: true, message: "DATA BARANG BARU BERHASIL DITAMBAHKAN & AKTIF DI INVENTORI!" };
      } catch (error) {
        throw new Error(error.message || "Gagal menyimpan data barang baru!");
      }
    }
  },

  // Hapus data barang
  handleDeleteBarang: async (id_sku) => {
    try {
      await KelolaBarangModel.deleteBarang(id_sku);
      return { success: true, message: "DATA BARANG BERHASIL DIHAPUS!" };
    } catch (error) {
      throw new Error(error.message || "Gagal menghapus data barang!");
    }
  },

  // Daftar pengiriman supplier yang berhasil -> sumber dropdown di halaman ini.
  // Data ini milik menu "Data Pengajuan", diambil lewat controller-nya supaya
  // View Kelola Barang tetap hanya bergantung pada satu controller (miliknya sendiri).
  fetchSuccessfulDeliveries: async () => {
    return await dataPengajuanController.fetchSuccessfulDeliveries();
  },

  // Tandai batch pengiriman sudah dimasukkan ke Kelola Barang.
  markDeliveryUsed: async (id) => {
    return await dataPengajuanController.markDeliveryUsed(id);
  },
};