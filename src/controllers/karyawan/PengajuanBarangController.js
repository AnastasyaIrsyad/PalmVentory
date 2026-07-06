import { PengajuanBarangModel } from "../../models/karyawan/PengajuanBarangModel";

export const pengajuanBarangController = {
  fetchKaryawanPageData: async (namaKaryawan) => {
    try {
      const [daftarBarang, riwayatPengajuan] = await Promise.all([
        PengajuanBarangModel.getAllBarangForKaryawan(),
        PengajuanBarangModel.getRiwayatByKaryawan(namaKaryawan),
      ]);
      return { daftarBarang, riwayatPengajuan };
    } catch (error) {
      throw new Error("Gagal memuat data halaman pengajuan karyawan: " + error.message);
    }
  },

  // Dipakai oleh Dashboard Karyawan (grafik "Barang Keluar per Bulan" & card
  // "Disetujui Tahun Ini" / "Menunggu Persetujuan") supaya SELALU sinkron
  // dengan data yang sama persis seperti tabel "Riwayat Pengajuan Kamu" di
  // menu Pengajuan Barang.
  fetchRiwayatKaryawan: async (namaKaryawan) => {
    try {
      return await PengajuanBarangModel.getRiwayatByKaryawan(namaKaryawan);
    } catch (error) {
      throw new Error("Gagal memuat riwayat pengajuan karyawan: " + error.message);
    }
  },

  handleAjukanBarang: async (namaKaryawan, detailForm, stokTersedia) => {
    if (!detailForm.id_sku || !detailForm.jumlah || !detailForm.nama_barang) {
      throw new Error("Pilih barang dan isi jumlah pengajuan!");
    }

    const jumlahMinta = parseInt(detailForm.jumlah);
    if (isNaN(jumlahMinta) || jumlahMinta <= 0) {
      throw new Error("Jumlah pengajuan harus berupa angka lebih dari 0!");
    }

    if (jumlahMinta > stokTersedia) {
      throw new Error(`Stok tidak mencukupi! Maksimal pengambilan adalah ${stokTersedia}.`);
    }

    const idManual = Math.floor(Date.now() % 100000000);
    const kodeFormulir = `RQ-${Math.floor(1000 + Math.random() * 9000)}`;

    const payload = {
      id: idManual,
      kode_permintaan: kodeFormulir,
      nama_karyawan: namaKaryawan,
      nama_barang: detailForm.nama_barang,
      jumlah: jumlahMinta,
      satuan: detailForm.satuan || "Unit",
      status: "Pending",
      alasan_penolakan: null,
    };

    try {
      return await PengajuanBarangModel.insertPengajuanKaryawan(payload);
    } catch (error) {
      throw new Error("Gagal mengirim data pengajuan baru: " + error.message);
    }
  },
};
