import React from "react";
import { CheckCircle2, MessageCircleWarning, X, ShieldCheck } from "lucide-react";

// Pop-up detail notifikasi karyawan saat admin sudah merespons (menyetujui
// atau menolak) pengajuan barang miliknya. Dibuka dari lonceng notifikasi
// pada Header (klik salah satu notifikasi -> "Cek Detail").
export default function PengajuanNotifDetailModal({ item, onClose }) {
  if (!item) return null;

  const disetujui = item?.status === "Disetujui";

  return (
    <div
      className="fixed inset-0 bg-[#2A0D12]/55 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-[#DAB88B]/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`px-5 py-4 flex items-center justify-between ${disetujui ? "bg-emerald-600" : "bg-[#4A151E]"}`}>
          <div className="flex items-center gap-2 text-white">
            {disetujui ? <CheckCircle2 size={18} /> : <MessageCircleWarning size={18} />}
            <span className="text-sm font-black uppercase tracking-wide">
              {disetujui ? "Pengajuan Disetujui" : "Pengajuan Ditolak"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
            <span>
              Kode: <span className="font-bold text-[#8B2635]">{item?.kode_permintaan || "-"}</span>
            </span>
            <span>
              Barang: <span className="font-bold text-[#4A151E]">{item?.nama_barang || "-"}</span>
            </span>
            <span>
              Jumlah: <span className="font-bold text-[#4A151E]">{item?.jumlah} {item?.satuan}</span>
            </span>
          </div>

          {/* Bubble chat dari admin */}
          <div className="flex items-start gap-2.5">
            <div className={`w-8 h-8 shrink-0 rounded-full text-white flex items-center justify-center ${disetujui ? "bg-emerald-600" : "bg-[#4A151E]"}`}>
              <ShieldCheck size={15} />
            </div>
            <div className="flex flex-col gap-1 max-w-[85%]">
              <span className="text-[10px] font-black uppercase tracking-wide text-gray-400">Admin</span>
              <div className={`text-sm font-medium rounded-2xl rounded-tl-sm px-4 py-3 leading-relaxed ${disetujui ? "bg-emerald-50 text-emerald-800" : "bg-[#F4EFE6] text-[#4A151E]"}`}>
                {disetujui
                  ? `Pengajuan barang "${item?.nama_barang || "-"}" sebanyak ${item?.jumlah || 0} ${item?.satuan || ""} telah disetujui dan stok telah dikeluarkan dari gudang.`
                  : item?.alasan_penolakan?.trim()
                  ? item.alasan_penolakan
                  : "Admin menolak pengajuan ini tanpa menyertakan keterangan tambahan."}
              </div>
              {item?.tgl_terima && (
                <span className="text-[10px] text-gray-400 mt-0.5">Diputuskan pada {item.tgl_terima}</span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-sm transition ${disetujui ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#4A151E] hover:bg-[#320e14]"}`}
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
