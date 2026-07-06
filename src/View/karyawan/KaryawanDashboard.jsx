import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { karyawanDashboardController } from "../../controllers/karyawan/KaryawanDashboardController";
import { pengajuanBarangController } from "../../controllers/karyawan/PengajuanBarangController";
import NotificationModal from "../../components/NotificationModal";
import {
  Package,
  Boxes,
  PackageCheck,
  Hourglass,
  BarChart3,
  Warehouse,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Ambil data pengguna yang sedang login dari localStorage (diisi saat proses login)
const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const NAMA_BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const CHART_COLORS = ["#4A151E", "#8B2635", "#DAB88B", "#C46B4E", "#6E8B3D", "#3D6E8B", "#8B3D6E", "#B08D57"];

export default function KaryawanDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const namaKaryawan = user?.nama_lengkap || "Karyawan";
  // Kunci pencarian riwayat pengajuan HARUS identik dengan nama yang dipakai
  // saat karyawan mengirim pengajuan di halaman "Stok Barang" (PengajuanBarang.jsx),
  // yaitu nama_lengkap, fallback ke email. Kalau tidak identik, riwayat tidak
  // akan pernah ketemu / tidak sinkron dengan tabel "Riwayat Pengajuan Kamu".
  const namaKaryawanQuery = user?.nama_lengkap || user?.email || "";

  const [stokList, setStokList] = useState([]);
  const [loadingStok, setLoadingStok] = useState(true);

  const [permintaanList, setPermintaanList] = useState([]);
  const [loadingPermintaan, setLoadingPermintaan] = useState(true);

  const [notification, setNotification] = useState(null);

  const loadStok = useCallback(async () => {
    try {
      setLoadingStok(true);
      const data = await karyawanDashboardController.fetchStokBarang();
      setStokList(data);
    } catch (err) {
      setNotification({ message: err.message, type: "error" });
    } finally {
      setLoadingStok(false);
    }
  }, []);

  const loadPermintaan = useCallback(async () => {
    if (!namaKaryawanQuery) return;
    try {
      setLoadingPermintaan(true);
      // Sumber data SAMA PERSIS dengan tabel "Riwayat Pengajuan Kamu" di menu
      // Stok Barang (tabel pengajuan_karyawan) — bukan lagi tabel lama yang
      // terpisah, supaya grafik & card di dashboard selalu sinkron.
      const data = await pengajuanBarangController.fetchRiwayatKaryawan(namaKaryawanQuery);
      setPermintaanList(data);
    } catch (err) {
      setNotification({ message: err.message, type: "error" });
    } finally {
      setLoadingPermintaan(false);
    }
  }, [namaKaryawanQuery]);

  useEffect(() => {
    loadStok();
    loadPermintaan();
    // Polling berkala supaya grafik & card dashboard otomatis ter-update
    // begitu admin menyetujui/menolak pengajuan, tanpa perlu reload manual.
    const interval = setInterval(() => loadPermintaan(), 15000);
    return () => clearInterval(interval);
  }, [loadStok, loadPermintaan]);

  const loading = loadingStok || loadingPermintaan;
  const v = (val) => (loading ? "..." : val);

  const currentYear = new Date().getFullYear();

  const totalStok = stokList.reduce((acc, curr) => acc + (parseInt(curr.stok) || 0), 0);
  const jenisBarang = stokList.length;
  const disetujuiTahunIni = permintaanList.filter((p) => {
    if (p.status !== "Disetujui") return false;
    const tgl = p.tgl_terima || p.created_at;
    return tgl && new Date(tgl).getFullYear() === currentYear;
  }).length;
  const menungguPersetujuan = permintaanList.filter((p) => p.status === "Pending").length;

  const metrics = [
    { label: "Total Stok (Unit)", value: v(totalStok), icon: Package },
    { label: "Jenis Barang", value: v(jenisBarang), icon: Boxes },
    { label: "Disetujui Tahun Ini", value: v(disetujuiTahunIni), icon: PackageCheck },
    { label: "Menunggu Persetujuan", value: v(menungguPersetujuan), icon: Hourglass },
  ];

  // ====== GRAFIK BATANG TAHUNAN: Barang Keluar (sudah di-ACC Admin) per Bulan ======
  const { chartData, itemNames } = useMemo(() => {
    const approved = permintaanList.filter((p) => {
      if (p.status !== "Disetujui") return false;
      const tgl = p.tgl_terima || p.created_at;
      if (!tgl) return false;
      return new Date(tgl).getFullYear() === currentYear;
    });

    // "total" selalu ada di setiap bulan (default 0) supaya grafik batang
    // tetap punya kerangka (sumbu X/Y & grid) meski belum ada transaksi
    // sama sekali. Begitu ada transaksi, batangnya otomatis "bergerak"
    // mengikuti data barang per nama barang di bawah ini.
    const monthly = NAMA_BULAN.map((label) => ({ bulan: label, total: 0 }));
    const itemSet = new Set();

    approved.forEach((p) => {
      const tgl = p.tgl_terima || p.created_at;
      const bulanIdx = new Date(tgl).getMonth();
      const nama = p.nama_barang || "Lainnya";
      const jumlah = parseInt(p.jumlah) || 0;
      itemSet.add(nama);
      monthly[bulanIdx][nama] = (monthly[bulanIdx][nama] || 0) + jumlah;
      monthly[bulanIdx].total += jumlah;
    });

    return { chartData: monthly, itemNames: Array.from(itemSet) };
  }, [permintaanList, currentYear]);

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
              Karyawan Panel
            </div>
            <h2 className="text-2xl font-bold text-[#4A151E] tracking-tight">
              Halo, {namaKaryawan.split(" ")[0]} 👋
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 max-w-xl">
              Pantau kondisi stok gudang dan laporan barang keluar tahunan
              langsung dari satu dashboard.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={() => navigate("/dashboard/karyawan/stok")}
                className="rounded-xl bg-[#4A151E] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3a1018] hover:shadow-lg hover:-translate-y-0.5 transform duration-200"
              >
                Lihat Stok Barang
              </button>
            </div>
          </div>
          <Warehouse className="absolute right-[-30px] bottom-[-30px] w-44 h-44 text-[#F4EFE6] opacity-70 rotate-[-10deg]" />
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

      {/* BARIS 2: Grafik Batang Tahunan */}
      <section className="grid grid-cols-1 gap-5">
        {/* Grafik batang tahunan — kerangka grafik SELALU tampil (sumbu &
            grid) walau belum ada transaksi barang keluar sama sekali.
            Begitu ada pengajuan yang disetujui admin, batangnya otomatis
            "bergerak" mengikuti data barang per bulan. */}
        <div className="rounded-2xl border border-[#DAB88B]/30 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={18} className="text-[#8B2635]" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Barang Keluar per Bulan {currentYear}
            </p>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Jumlah barang yang sudah disetujui (di-ACC) admin, per bulan.
          </p>

          <div className="w-full h-80">
            {loadingPermintaan ? (
              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-gray-400 animate-pulse">
                Memuat grafik...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -12, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE3D3" vertical={false} />
                  <XAxis
                    dataKey="bulan"
                    tick={{ fontSize: 10, fill: "#8B7355" }}
                    stroke="#DAB88B"
                    interval={0}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#8B7355" }} stroke="#DAB88B" />
                  <Tooltip
                    cursor={{ fill: "#F4EFE6" }}
                    contentStyle={{ borderRadius: 12, border: "1px solid #DAB88B", fontSize: 12 }}
                    labelStyle={{ fontWeight: 700, color: "#4A151E" }}
                  />
                  {itemNames.length > 0 && <Legend wrapperStyle={{ fontSize: 11 }} />}
                  {itemNames.length > 0 ? (
                    itemNames.map((nama, i) => (
                      <Bar
                        key={nama}
                        dataKey={nama}
                        name={nama}
                        stackId="barangKeluar"
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                        radius={i === itemNames.length - 1 ? [8, 8, 0, 0] : 0}
                        maxBarSize={60}
                      />
                    ))
                  ) : (
                    // Belum ada transaksi -> tetap render Bar dengan nilai 0
                    // supaya kerangka grafik batang tampil (sumbu & grid).
                    <Bar dataKey="total" name="Barang Keluar" fill="#DAB88B" radius={[8, 8, 0, 0]} maxBarSize={60} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {!loadingPermintaan && itemNames.length === 0 && (
            <p className="text-center text-xs text-gray-400 mt-2">
              Belum ada barang keluar (disetujui admin) pada tahun {currentYear}. Grafik akan otomatis
              bergerak begitu ada transaksi.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
