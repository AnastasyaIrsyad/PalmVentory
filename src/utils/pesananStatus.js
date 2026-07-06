// =====================================================================
// STATUS PESANAN SUPPLIER — Sumber kebenaran tunggal untuk seluruh alur
// Admin <-> Supplier, dipakai bersama oleh View Admin & View Supplier
// agar label, warna, dan urutan alur selalu konsisten.
// =====================================================================

export const PESANAN_STATUS = {
  MENUNGGU: "Menunggu Konfirmasi", // Admin baru membuat permintaan ke supplier
  DIPROSES_SUPPLIER: "Diproses Supplier", // Supplier menerima & sedang menyiapkan barang
  DITOLAK_SUPPLIER: "Ditolak Supplier", // Supplier menolak permintaan admin
  DIKIRIM: "Dikirim", // Supplier sudah input ETA & mengirim barang
  SAMPAI: "Sampai", // Supplier menandai barang sudah sampai di tujuan
  SELESAI: "Selesai", // Admin konfirmasi terima -> stok gudang bertambah
  DITOLAK_ADMIN: "Ditolak Admin", // Admin tidak menerima barang saat sampai
  DIBATALKAN: "Dibatalkan", // Admin membatalkan permintaan miliknya sendiri
};

// Style badge per status (dipakai di tabel Admin & Supplier)
export const getStatusStyle = (status) => {
  switch (status) {
    case PESANAN_STATUS.MENUNGGU:
      return "bg-amber-100 text-amber-700";
    case PESANAN_STATUS.DIPROSES_SUPPLIER:
      return "bg-blue-100 text-blue-700";
    case PESANAN_STATUS.DITOLAK_SUPPLIER:
      return "bg-red-100 text-red-700";
    case PESANAN_STATUS.DIKIRIM:
      return "bg-indigo-100 text-indigo-700";
    case PESANAN_STATUS.SAMPAI:
      return "bg-purple-100 text-purple-700";
    case PESANAN_STATUS.SELESAI:
      return "bg-emerald-100 text-emerald-700";
    case PESANAN_STATUS.DITOLAK_ADMIN:
      return "bg-rose-100 text-rose-700";
    case PESANAN_STATUS.DIBATALKAN:
      return "bg-gray-200 text-gray-600";
    default:
      return "bg-amber-100 text-amber-700";
  }
};

// Status lama yang mungkin masih tersimpan di database (data historis)
// dipetakan supaya UI tidak rusak untuk baris pesanan yang dibuat sebelum
// alur baru ini diterapkan.
const LEGACY_STATUS_MAP = {
  Diproses: PESANAN_STATUS.MENUNGGU,
  Terkirim: PESANAN_STATUS.DIKIRIM,
  Diterima: PESANAN_STATUS.SELESAI,
};

export const normalizeStatus = (status) => {
  if (!status) return PESANAN_STATUS.MENUNGGU;
  return LEGACY_STATUS_MAP[status] || status;
};

export const isSelesai = (status) => normalizeStatus(status) === PESANAN_STATUS.SELESAI;
export const isDitolakAdmin = (status) => normalizeStatus(status) === PESANAN_STATUS.DITOLAK_ADMIN;
export const isDitolakSupplier = (status) => normalizeStatus(status) === PESANAN_STATUS.DITOLAK_SUPPLIER;
export const isDibatalkan = (status) => normalizeStatus(status) === PESANAN_STATUS.DIBATALKAN;
export const isFinal = (status) =>
  [PESANAN_STATUS.SELESAI, PESANAN_STATUS.DITOLAK_ADMIN, PESANAN_STATUS.DITOLAK_SUPPLIER, PESANAN_STATUS.DIBATALKAN].includes(
    normalizeStatus(status),
  );

// Hitung selisih hari dari hari ini menuju tanggal_kebutuhan (PO H- berapa hari)
export const hitungSisaHari = (tanggalKebutuhan) => {
  if (!tanggalKebutuhan) return null;
  const target = new Date(tanggalKebutuhan);
  if (isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export const labelSisaHari = (tanggalKebutuhan) => {
  const sisa = hitungSisaHari(tanggalKebutuhan);
  if (sisa === null) return "-";
  if (sisa > 0) return `PO H-${sisa} hari`;
  if (sisa === 0) return "";
  return `Lewat ${Math.abs(sisa)} hari`;
};
