import React, { useEffect, useState, useCallback } from "react";
import { kelolaPesananController } from "../../controllers/supplier/KelolaPesananController";
import { PESANAN_STATUS, getStatusStyle, labelSisaHari } from "../../utils/pesananStatus";
import NotificationModal from "../../components/NotificationModal";
import RejectPesananModal from "../../components/RejectPesananModal";
import { ChevronRight, Loader2, Send, Inbox, Check, X, Clock } from "lucide-react";

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

const COLS = 6;

export default function KelolaPesanan() {
  const user = getCurrentUser();
  const supplierId = user?.id;
  const namaSupplier = user?.nama_lengkap;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [etaInputs, setEtaInputs] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [rejectItem, setRejectItem] = useState(null); // item yang mau ditolak -> dibuka di pop-up

  const triggerNotification = (message, type = "success") => setNotification({ message, type });

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await kelolaPesananController.fetchPesanan(supplierId, namaSupplier);
      // Kelola Pesanan = permintaan yang masih aktif di tangan supplier
      // (belum ditolak, belum dikirim)
      setOrders(
        data.filter((o) =>
          [PESANAN_STATUS.MENUNGGU, PESANAN_STATUS.DIPROSES_SUPPLIER].includes(o.status),
        ),
      );
    } catch (error) {
      triggerNotification(error.message || "Gagal memuat data pesanan.", "error");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [supplierId, namaSupplier]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleEtaChange = (id, value) => setEtaInputs((prev) => ({ ...prev, [id]: value }));

  const handleTerima = async (item) => {
    setSavingId(item.id);
    try {
      const res = await kelolaPesananController.terimaPesanan(item.id);
      triggerNotification(res.message, "success");
      await loadOrders();
    } catch (error) {
      triggerNotification(error.message, "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleTolak = async (item, alasan) => {
    setSavingId(item.id);
    try {
      const res = await kelolaPesananController.tolakPesanan(item.id, alasan);
      triggerNotification(res.message, "success");
      setRejectItem(null);
      await loadOrders();
    } catch (error) {
      triggerNotification(error.message, "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleKonfirmasiKirim = async (item) => {
    const eta = etaInputs[item.id] || "";
    setSavingId(item.id);
    try {
      const res = await kelolaPesananController.konfirmasiKirim(item.id, eta);
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
      {rejectItem && (
        <RejectPesananModal
          item={rejectItem}
          submitting={savingId === rejectItem.id}
          onClose={() => setRejectItem(null)}
          onConfirm={handleTolak}
        />
      )}

      <div className="bg-white p-5 rounded-3xl border border-[#DAB88B]/30 shadow-sm">
        <nav className="flex items-center gap-2 text-xs font-black text-[#8B2635] uppercase tracking-wide mb-1">
          <span>Supplier</span> <ChevronRight size={10} /> <span>Kelola Pesanan</span>
        </nav>
        <h1 className="text-3xl font-black text-[#4A151E] tracking-tight">Kelola Pesanan</h1>
        <p className="mt-1.5 text-sm text-gray-500 max-w-2xl">
          Permintaan barang baru dari admin kebun. <span className="font-semibold text-[#8B2635]">Terima</span>{" "}
          atau <span className="font-semibold text-[#8B2635]">Tolak</span> permintaan, lalu untuk yang diterima
          isi tanggal estimasi tiba (ETA) dan klik <span className="font-semibold text-[#8B2635]">Konfirmasi Kirim</span>.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#DAB88B]/30 shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[920px]">
            <thead className="bg-[#4A151E] text-[#DAB88B]">
              <tr className="text-xs font-black uppercase tracking-widest text-left">
                <th className="p-4 rounded-l-2xl">Kode Pesanan</th>
                <th className="p-4">Nama Barang</th>
                <th className="p-4">Jumlah</th>
                <th className="p-4">Catatan Admin</th>
                <th className="p-4">Kebutuhan</th>
                <th className="p-4 rounded-r-2xl">Aksi Supplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE6] text-xs font-bold text-[#4A151E]">
              {loading ? (
                <tr>
                  <td colSpan={COLS} className="py-14 text-center text-gray-400">
                    <Loader2 size={18} className="animate-spin inline mr-2" /> Memuat pesanan dari database...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={COLS} className="py-14 text-center text-gray-400">
                    <Inbox size={36} className="mx-auto mb-2 text-[#DAB88B]" />
                    <p className="text-sm font-semibold">Belum ada permintaan barang baru dari admin.</p>
                    <p className="text-xs mt-1">Pesanan yang dibuat admin akan muncul otomatis di sini.</p>
                  </td>
                </tr>
              ) : (
                orders.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F4EFE6]/40 transition align-top">
                    <td className="p-4 font-mono text-[#8B2635] text-sm">{item.kode_pesanan || "-"}</td>
                    <td className="p-4 text-gray-700">{item.nama_barang || "-"}</td>
                    <td className="p-4 text-gray-600">{item.jumlah} {item.satuan}</td>
                    <td className="p-4 text-gray-500 font-medium max-w-[200px]">{item.catatan || "-"}</td>
                    <td className="p-4 text-gray-500 font-medium">
                      <div className="flex flex-col gap-1">
                        <span>{formatTanggal(item.tanggal_kebutuhan)}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-600">
                          <Clock size={10} /> {labelSisaHari(item.tanggal_kebutuhan)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {item.status === PESANAN_STATUS.MENUNGGU ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTerima(item)}
                            disabled={savingId === item.id}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 text-xs font-black uppercase tracking-wider hover:bg-emerald-100 transition disabled:opacity-50"
                          >
                            {savingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} strokeWidth={3} />}
                            Terima
                          </button>
                          <button
                            onClick={() => setRejectItem(item)}
                            disabled={savingId === item.id}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 px-3 py-2 text-xs font-black uppercase tracking-wider hover:bg-red-100 transition disabled:opacity-50"
                          >
                            <X size={12} strokeWidth={3} /> Tolak
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <input
                            type="date"
                            value={etaInputs[item.id] || ""}
                            onChange={(e) => handleEtaChange(item.id, e.target.value)}
                            className="rounded-xl border border-[#DAB88B]/50 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#4A151E] focus:outline-none focus:ring-2 focus:ring-[#DAB88B]/30"
                          />
                          <button
                            onClick={() => handleKonfirmasiKirim(item)}
                            disabled={savingId === item.id}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#4A151E] px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-[#320e14] transition shadow-sm disabled:opacity-50"
                          >
                            {savingId === item.id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                            Konfirmasi Kirim
                          </button>
                        </div>
                      )}
                      <span className={`mt-2 inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </span>
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
