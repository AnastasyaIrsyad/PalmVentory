import React, { useState } from "react";
import { PackageCheck, PackageX, X, Loader2, Truck } from "lucide-react";

const formatTanggal = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

// Pop-up di tengah layar saat Admin membuka notifikasi "Barang Sudah Sampai".
// Admin bisa menekan Diterima (stok gudang bertambah) atau Tidak Diterima
// (barang dikembalikan / ditolak, stok tidak bertambah).
export default function SupplierArrivalModal({ item, onClose, onAccept, onReject }) {
  const [loadingAction, setLoadingAction] = useState(null); // "accept" | "reject" | null
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [alasan, setAlasan] = useState("");

  if (!item) return null;

  const handleAccept = async () => {
    setLoadingAction("accept");
    try {
      await onAccept(item);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async () => {
    setLoadingAction("reject");
    try {
      await onReject(item, alasan);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2A0D12]/55 backdrop-blur-sm z-[60] flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-[#DAB88B]/40 overflow-hidden">
        <div className="bg-[#4A151E] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Truck size={18} />
            <span className="text-sm font-black uppercase tracking-wide">Barang Sudah Sampai</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 text-center">
          <p className="text-sm text-gray-500">
            Supplier <span className="font-bold text-[#8B2635]">{item?.nama_supplier || "-"}</span> menandai
            pesanan berikut sudah sampai di lokasi kebun:
          </p>

          <div className="bg-[#F4EFE6] rounded-2xl p-4 text-left space-y-1">
            <p className="text-base font-black text-[#4A151E]">{item?.nama_barang || "-"}</p>
            <p className="text-xs text-gray-600">
              Jumlah: <span className="font-bold">{item?.jumlah} {item?.satuan}</span>
            </p>
            <p className="text-xs text-gray-600">
              Kode Pesanan: <span className="font-mono font-bold">{item?.kode_pesanan || "-"}</span>
            </p>
            <p className="text-xs text-gray-600">Estimasi Tiba: {formatTanggal(item?.eta)}</p>
          </div>

          {!showRejectForm ? (
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={!!loadingAction}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-xs font-black uppercase tracking-wider hover:bg-red-100 transition disabled:opacity-50"
              >
                <PackageX size={15} /> Tidak Diterima
              </button>
              <button
                onClick={handleAccept}
                disabled={!!loadingAction}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-3 text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
              >
                {loadingAction === "accept" ? <Loader2 size={15} className="animate-spin" /> : <PackageCheck size={15} />}
                Diterima
              </button>
            </div>
          ) : (
            <div className="text-left space-y-3 pt-1">
              <label className="text-xs font-black uppercase tracking-wide text-[#4A151E]">
                Alasan tidak diterima (opsional)
              </label>
              <textarea
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                rows={3}
                placeholder="Contoh: Barang rusak / jumlah tidak sesuai pesanan"
                className="w-full rounded-xl border border-[#DAB88B]/40 bg-[#FBF8F2] px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#4A151E] focus:ring-2 focus:ring-[#DAB88B]/30"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectForm(false)}
                  disabled={!!loadingAction}
                  className="flex-1 rounded-xl border border-[#DAB88B]/50 text-[#4A151E] px-4 py-3 text-xs font-black uppercase tracking-wider hover:bg-[#F4EFE6] transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleReject}
                  disabled={!!loadingAction}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white px-4 py-3 text-xs font-black uppercase tracking-wider hover:bg-red-700 transition shadow-sm disabled:opacity-50"
                >
                  {loadingAction === "reject" ? <Loader2 size={15} className="animate-spin" /> : <PackageX size={15} />}
                  Konfirmasi Tolak
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
