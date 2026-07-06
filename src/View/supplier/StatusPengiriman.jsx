import React, { useEffect, useState, useCallback } from "react";
import { statusPengirimanController } from "../../controllers/supplier/StatusPengirimanController";
import { PESANAN_STATUS, getStatusStyle } from "../../utils/pesananStatus";
import NotificationModal from "../../components/NotificationModal";
import { ChevronRight, Loader2, Truck, CheckCircle2, Inbox, MapPin, XCircle } from "lucide-react";

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const formatTanggal = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

const COLS = 7;

export default function StatusPengiriman() {
  const user = getCurrentUser();
  const supplierId = user?.id;
  const namaSupplier = user?.nama_lengkap;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const triggerNotification = (message, type = "success") => setNotification({ message, type });

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await statusPengirimanController.fetchPesanan(supplierId, namaSupplier);
      // Status Pengiriman = pesanan yang sudah dikirim s.d. selesai/ditolak admin
      setOrders(
        data.filter((o) =>
          [
            PESANAN_STATUS.DIKIRIM,
            PESANAN_STATUS.SAMPAI,
            PESANAN_STATUS.SELESAI,
            PESANAN_STATUS.DITOLAK_ADMIN,
          ].includes(o.status),
        ),
      );
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [supplierId, namaSupplier]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleTandaiSampai = async (item) => {
    setSavingId(item.id);
    try {
      const res = await statusPengirimanController.tandaiSampai(item.id);
      triggerNotification(res.message, "success");
      await loadOrders();
    } catch (error) {
      triggerNotification(error.message, "error");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-6 lg:p-8 bg-[#FDFBF7] rounded-4xl flex flex-col gap-6">
      {notification && (
        <NotificationModal notification={notification} onClose={() => setNotification(null)} />
      )}

      <div className="bg-white p-5 rounded-3xl border border-[#DAB88B]/30 shadow-sm">
        <nav className="flex items-center gap-2 text-xs font-black text-[#8B2635] uppercase tracking-wide mb-1">
          <span>Supplier</span> <ChevronRight size={10} /> <span>Status Pengiriman</span>
        </nav>
        <h1 className="text-3xl font-black text-[#4A151E] tracking-tight">Status Pengiriman</h1>
        <p className="mt-1.5 text-sm text-gray-500 max-w-2xl">
          Pesanan yang sedang dalam perjalanan. Setelah barang tiba secara fisik di kebun, klik{" "}
          <span className="font-semibold text-[#8B2635]">Barang Sudah Sampai</span> untuk memberi tahu admin.
          Status akhir <span className="font-semibold text-emerald-600">Selesai</span> muncul otomatis saat admin
          mengonfirmasi penerimaan.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#DAB88B]/30 shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[940px]">
            <thead className="bg-[#4A151E] text-[#DAB88B]">
              <tr className="text-xs font-black uppercase tracking-widest text-left">
                <th className="p-4 rounded-l-2xl">Kode Pesanan</th>
                <th className="p-4">Nama Barang</th>
                <th className="p-4">Jumlah</th>
                <th className="p-4">Estimasi Sampai (ETA)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Keterangan</th>
                <th className="p-4 rounded-r-2xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE6] text-xs font-bold text-[#4A151E]">
              {loading ? (
                <tr>
                  <td colSpan={COLS} className="py-14 text-center text-gray-400">
                    <Loader2 size={18} className="animate-spin inline mr-2" /> Memuat status pengiriman...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={COLS} className="py-14 text-center text-gray-400">
                    <Inbox size={36} className="mx-auto mb-2 text-[#DAB88B]" />
                    <p className="text-sm font-semibold">Belum ada pesanan yang dikirim.</p>
                    <p className="text-xs mt-1">Pesanan yang sudah dikonfirmasi kirim akan tampil di sini.</p>
                  </td>
                </tr>
              ) : (
                orders.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F4EFE6]/40 transition">
                    <td className="p-4 font-mono text-[#8B2635] text-sm">{item.kode_pesanan || "-"}</td>
                    <td className="p-4 text-gray-700">{item.nama_barang || "-"}</td>
                    <td className="p-4 text-gray-600">{item.jumlah} {item.satuan}</td>
                    <td className="p-4 text-gray-600 font-medium">{formatTanggal(item.eta)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase ${getStatusStyle(item.status)}`}>
                        {item.status === PESANAN_STATUS.SELESAI && <CheckCircle2 size={13} />}
                        {item.status === PESANAN_STATUS.DITOLAK_ADMIN && <XCircle size={13} />}
                        {item.status === PESANAN_STATUS.SAMPAI && <MapPin size={13} />}
                        {item.status === PESANAN_STATUS.DIKIRIM && <Truck size={13} />}
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.status === PESANAN_STATUS.DITOLAK_ADMIN && item.alasan_penolakan ? (
                        <p className="text-xs italic text-rose-500 max-w-[220px]">{item.alasan_penolakan}</p>
                      ) : (
                        <span className="text-gray-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {item.status === PESANAN_STATUS.DIKIRIM ? (
                        <button
                          onClick={() => handleTandaiSampai(item)}
                          disabled={savingId === item.id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#4A151E] px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-[#320e14] transition shadow-sm disabled:opacity-50"
                        >
                          {savingId === item.id ? <Loader2 size={13} className="animate-spin" /> : <MapPin size={13} />}
                          Barang Sudah Sampai
                        </button>
                      ) : item.status === PESANAN_STATUS.SAMPAI ? (
                        <span className="text-amber-500 font-medium italic text-xs">Menunggu konfirmasi admin...</span>
                      ) : item.status === PESANAN_STATUS.SELESAI ? (
                        <span className="text-emerald-600 font-medium italic text-xs">Barang diterima admin</span>
                      ) : (
                        <span className="text-rose-500 font-medium italic text-xs">Tidak diterima admin</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
