import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supplierDashboardController } from "../../controllers/supplier/SupplierDashboardController";
import { isSelesai, PESANAN_STATUS } from "../../utils/pesananStatus";
import NotificationModal from "../../components/NotificationModal";
import {
  Package,
  Truck,
  PackageCheck,
  ShoppingCart,
  BarChart3,
  Clock3,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

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

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const supplierId = user?.id;
  const namaSupplier = user?.nama_lengkap || "Supplier";

  const [pesananList, setPesananList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await supplierDashboardController.fetchPesanan(supplierId, namaSupplier);
      setPesananList(data);
    } catch (err) {
      setNotification({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [supplierId, namaSupplier]);

  useEffect(() => {
    load();
  }, [load]);

  // Klasifikasi berdasarkan status asli pesanan (bukan lagi tebakan dari ada/tidaknya ETA)
  const perluDikirim = pesananList.filter((p) =>
    [PESANAN_STATUS.MENUNGGU, PESANAN_STATUS.DIPROSES_SUPPLIER].includes(p.status),
  ).length;
  const sedangDikirim = pesananList.filter((p) => p.status === PESANAN_STATUS.DIKIRIM).length;
  const sampai = pesananList.filter((p) => p.status === PESANAN_STATUS.SAMPAI).length;
  const ditolak = pesananList.filter((p) =>
    [PESANAN_STATUS.DITOLAK_SUPPLIER, PESANAN_STATUS.DITOLAK_ADMIN].includes(p.status),
  ).length;
  const selesai = pesananList.filter((p) => isSelesai(p.status)).length;
  const total = pesananList.length;

  const v = (val) => (loading ? "..." : val);

  const metrics = [
    { label: "Total Pesanan", value: v(total), icon: ShoppingCart },
    { label: "Perlu Dikirim", value: v(perluDikirim), icon: Package },
    { label: "Sedang Dikirim", value: v(sedangDikirim), icon: Truck },
    { label: "Selesai / Diterima", value: v(selesai), icon: PackageCheck },
  ];

  // Ringkasan pesanan per status untuk grafik batang di dashboard
  const chartData = [
    { nama: "Perlu Dikirim", jumlah: perluDikirim, warna: "#DAB88B" },
    { nama: "Sedang Dikirim", jumlah: sedangDikirim, warna: "#8B2635" },
    { nama: "Sampai", jumlah: sampai, warna: "#7C3AED" },
    { nama: "Ditolak", jumlah: ditolak, warna: "#DC2626" },
    { nama: "Selesai", jumlah: selesai, warna: "#2F7D5B" },
  ];

  const recent = [...pesananList]
    .sort((a, b) => new Date(b.dibuat_pada) - new Date(a.dibuat_pada))
    .slice(0, 5);

  return (
    <div className="w-full h-full overflow-y-auto pr-1 flex flex-col gap-5 pb-4">
      {notification && (
        <NotificationModal notification={notification} onClose={() => setNotification(null)} />
      )}

      {/* BARIS 1: Welcome Banner & Metrics */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 rounded-2xl border border-[#DAB88B]/30 bg-white p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-block rounded-lg bg-[#F4EFE6] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#8B2635] mb-4">
              Supplier Panel
            </div>
            <h2 className="text-2xl font-bold text-[#4A151E] tracking-tight">
              Halo, {namaSupplier.split(" ")[0]} 👋
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 max-w-xl">
              Pantau permintaan barang dari admin kebun, siapkan pasokan, dan kelola status
              pengiriman Anda dalam satu tempat.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={() => navigate("/dashboard/supplier/kelola-pesanan")}
                className="rounded-xl bg-[#4A151E] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3a1018] hover:shadow-lg hover:-translate-y-0.5 transform duration-200"
              >
                Kelola Pesanan
              </button>
            </div>
          </div>
          <Truck className="absolute right-[-30px] bottom-[-30px] w-44 h-44 text-[#F4EFE6] opacity-70 rotate-[-10deg]" />
        </div>

        <div className="xl:col-span-4 grid grid-cols-2 gap-4">
          {metrics.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-[#DAB88B]/30 bg-white p-5 shadow-sm flex flex-col justify-between hover:border-[#DAB88B] transition-colors"
            >
              <div className="rounded-xl p-2.5 text-[#8B2635] bg-[#F4EFE6] shadow-sm w-fit mb-2">
                <item.icon size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#4A151E]">{item.value}</h3>
                <p className="text-xs font-semibold uppercase tracking-wide mt-1 text-gray-400">
                  {item.label}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* BARIS 2: Grafik Batang + Pesanan Terbaru */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Grafik batang ke atas */}
        <div className="xl:col-span-7 rounded-2xl border border-[#DAB88B]/30 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={18} className="text-[#8B2635]" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Ringkasan Pesanan per Status
            </p>
          </div>
          <p className="text-xs text-gray-400 mb-4">Jumlah pesanan berdasarkan tahap alur pengiriman.</p>

          <div className="w-full h-72">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-gray-400 animate-pulse">
                Memuat grafik...
              </div>
            ) : total === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-center">
                <BarChart3 size={28} className="mb-2 opacity-40" />
                <p className="text-sm font-semibold">Belum ada pesanan untuk ditampilkan.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -12, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE3D3" vertical={false} />
                  <XAxis
                    dataKey="nama"
                    tick={{ fontSize: 10, fill: "#8B7355" }}
                    stroke="#DAB88B"
                    interval={0}
                    angle={-12}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#8B7355" }} stroke="#DAB88B" />
                  <Tooltip
                    cursor={{ fill: "#F4EFE6" }}
                    contentStyle={{ borderRadius: 12, border: "1px solid #DAB88B", fontSize: 12 }}
                  />
                  <Bar dataKey="jumlah" radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.warna} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pesanan terbaru */}
        <div className="xl:col-span-5 rounded-2xl border border-[#DAB88B]/30 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Pesanan Terbaru</p>
            <button
              onClick={() => navigate("/dashboard/supplier/kelola-pesanan")}
              className="text-xs font-semibold text-[#8B2635] hover:text-[#4A151E] transition flex items-center gap-1"
            >
              Lihat Semua <ArrowUpRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-400 gap-2 text-sm">
              <Loader2 size={18} className="animate-spin" /> Memuat...
            </div>
          ) : recent.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <Clock3 className="mb-2 text-[#DAB88B]" size={28} />
              <p className="text-sm text-gray-400">Belum ada pesanan masuk.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
              {recent.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-100 bg-[#FBF8F2] p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-white border border-gray-100 text-[#DAB88B] shrink-0">
                      <Package size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#4A151E] truncate">
                        {item.kode_pesanan} · {item.nama_barang}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.jumlah} {item.satuan} · {formatTanggal(item.dibuat_pada)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      isSelesai(item.status)
                        ? "bg-emerald-100 text-emerald-700"
                        : item.eta
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isSelesai(item.status) ? "Selesai" : item.eta ? "Dikirim" : "Baru"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
