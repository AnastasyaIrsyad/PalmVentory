import React, { useState } from "react";
import { XCircle, X, Loader2, ShieldAlert } from "lucide-react";

// Pop-up di tengah layar saat Admin menekan tombol "Tolak" pada salah satu
// baris pengajuan barang keluar karyawan. Alasan penolakan wajib diisi di
// dalam pop-up ini (menggantikan window.prompt bawaan browser).
export default function RejectPermintaanModal({ item, onClose, onConfirm, submitting }) {
  const [alasan, setAlasan] = useState("");
  const [error, setError] = useState("");

  if (!item) return null;

  const handleConfirm = async () => {
    if (!alasan.trim()) {
      setError("Alasan penolakan harus diisi!");
      return;
    }
    setError("");
    await onConfirm(item, alasan.trim());
  };

  return (
    <div
      className="fixed inset-0 bg-[#2A0D12]/55 backdrop-blur-sm z-[60] flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-[#DAB88B]/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#4A151E] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <ShieldAlert size={18} />
            <span className="text-sm font-black uppercase tracking-wide">Tolak Pengajuan Karyawan</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500">
            Anda akan menolak pengajuan barang keluar berikut dari karyawan:
          </p>

          <div className="bg-[#F4EFE6] rounded-2xl p-4 text-left space-y-1">
            <p className="text-base font-black text-[#4A151E]">{item?.nama_barang || "-"}</p>
            <p className="text-xs text-gray-600">
              Pemohon: <span className="font-bold">{item?.nama_karyawan || "-"}</span>
            </p>
            <p className="text-xs text-gray-600">
              Jumlah: <span className="font-bold">{item?.jumlah} {item?.satuan}</span>
            </p>
            <p className="text-xs text-gray-600">
              Kode Pengajuan: <span className="font-mono font-bold">{item?.kode_permintaan || "-"}</span>
            </p>
          </div>

          <div className="text-left space-y-2">
            <label className="text-xs font-black uppercase tracking-wide text-[#4A151E]">
              Alasan penolakan
            </label>
            <textarea
              value={alasan}
              onChange={(e) => {
                setAlasan(e.target.value);
                if (error) setError("");
              }}
              rows={3}
              placeholder="Contoh: Stok barang sedang menipis / diprioritaskan untuk kebutuhan lain"
              autoFocus
              className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 transition ${
                error
                  ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200"
                  : "border-[#DAB88B]/40 bg-[#FBF8F2] focus:border-[#4A151E] focus:ring-[#DAB88B]/30"
              }`}
            />
            {error && <p className="text-xs font-bold text-red-600">{error}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-xl border border-[#DAB88B]/50 text-[#4A151E] px-4 py-3 text-xs font-black uppercase tracking-wider hover:bg-[#F4EFE6] transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white px-4 py-3 text-xs font-black uppercase tracking-wider hover:bg-red-700 transition shadow-sm disabled:opacity-50"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
              Konfirmasi Tolak
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
