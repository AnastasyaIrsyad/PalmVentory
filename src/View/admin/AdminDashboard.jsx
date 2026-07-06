import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Package,
  ClipboardList,
  PackageCheck,
  Activity,
  ChartBar,
  ArrowUpRight,
  RefreshCw,
  UserPlus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { adminDashboardController } from "../../controllers/admin/AdminDashboardController";

// Ambil data pengguna yang sedang login dari localStorage
const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Format angka ribuan (mis. 1.250)
const fmt = (n) =>
  typeof n === "number" ? n.toLocaleString("id-ID") : n;

// Waktu relatif untuk Catatan Sistem (mis. "baru saja", "5 menit lalu", "2 jam lalu")
const formatRelativeTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return "baru saja";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} hari lalu`;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const namaAdmin = user?.nama_lengkap || "Admin";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [newAccounts, setNewAccounts] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminDashboardController.fetchDashboardData();
      setStats(data);
      setNewAccounts(adminDashboardController.getNewAccounts(data.profiles));
      setSelectedYear(new Date().getFullYear());
      setChartData(data.chartData);
    } catch (err) {
      console.error("Gagal memuat data dashboard:", err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle perubahan tahun
  const handleYearChange = (year) => {
    setSelectedYear(year);
    if (stats?.pengajuan && stats?.pesanan) {
      const newChartData = adminDashboardController.getChartDataByYear(
        stats.pengajuan,
        stats.pesanan,
        year
      );
      setChartData(newChartData);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const v = (val) => (loading || !stats ? "..." : val);

  // Empat metrik utama dashboard admin
  const metrics = [
    {
      label: "Total Pengguna",
      value: v(fmt(stats?.totalPengguna)),
      icon: Users,
    },
    {
      label: "Stok TBS & Produk",
      value: v(fmt(stats?.totalStok)),
      icon: Package,
    },
    {
      label: "Jumlah Ajuan Karyawan",
      value: v(fmt(stats?.jumlahAjuan)),
      icon: ClipboardList,
    },
    {
      label: "Jumlah Permintaan Barang",
      value: v(fmt(stats?.jumlahPermintaanBarang)),
      icon: PackageCheck,
    },
  ];

  const persenKaryawan = stats?.persenKaryawan ?? 0;
  const persenSupplier = stats?.persenSupplier ?? 0;

  return (
    <div className="w-full h-full overflow-y-auto pr-1 flex flex-col gap-5 pb-4">
      {/* BARIS 1: Welcome Banner & Metrics */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Welcome Banner - Span 8 */}
        <div className="xl:col-span-8 rounded-2xl border border-[#DAB88B]/30 bg-white p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-block rounded-lg bg-[#F4EFE6] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#8B2635] mb-4">
              Admin Panel
            </div>
            <h2 className="text-2xl font-bold text-[#4A151E] tracking-tight">
              Selamat datang, {namaAdmin}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 max-w-xl">
              Kelola pengguna, pantau stok Tandan Buah Segar (TBS), dan evaluasi
              laporan produksi dalam satu tampilan yang terpusat dan efisien.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={() => navigate("/laporan")}
                className="rounded-xl bg-[#4A151E] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3a1018] hover:shadow-lg hover:-translate-y-0.5 transform duration-200"
              >
                Buka Laporan
              </button>
            </div>
          </div>
          <Activity className="absolute right-[-30px] bottom-[-30px] w-44 h-44 text-[#F4EFE6] opacity-70 rotate-[-10deg]" />
        </div>

        {/* Metrics Grid - Span 4 */}
        <div className="xl:col-span-4 grid grid-cols-2 gap-4">
          {metrics.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-[#DAB88B]/30 bg-white p-5 shadow-sm flex flex-col justify-between hover:border-[#DAB88B] transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="rounded-xl p-2.5 text-[#8B2635] bg-[#F4EFE6] shadow-sm">
                  <item.icon size={18} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#4A151E]">
                  {item.value}
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wide mt-1 text-gray-400">
                  {item.label}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* BARIS 2: Grafik Garis Barang Masuk & Keluar per Bulan (full width) */}
      <section className="grid grid-cols-1">
        <div className="rounded-2xl border border-[#DAB88B]/30 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-[#8B2635]" />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Pergerakan Barang (Masuk &amp; Keluar) per Bulan
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Year Selector */}
              {stats?.availableYears && stats.availableYears.length > 0 && (
                <div className="flex items-center gap-2 bg-[#FBF8F2] rounded-lg px-3 py-1.5 border border-[#DAB88B]/30">
                  <span className="text-xs font-semibold text-gray-500">Tahun:</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(parseInt(e.target.value))}
                    className="bg-transparent text-xs font-bold text-[#4A151E] outline-none cursor-pointer hover:text-[#8B2635]"
                  >
                    {stats.availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={loadData}
                className="rounded-lg border border-[#DAB88B] bg-[#FBF8F2] px-4 py-1.5 text-xs font-semibold text-[#4A151E] hover:bg-[#F4EFE6] transition flex items-center gap-1.5"
              >
                <RefreshCw size={13} /> Update Data
              </button>
            </div>
          </div>

          {/* Legend kecil */}
          <div className="flex items-center gap-5 mb-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-[#4A151E]">
              <TrendingUp size={14} className="text-[#2F7D5B]" /> Barang Masuk
            </span>
            <span className="flex items-center gap-2 text-xs font-semibold text-[#4A151E]">
              <TrendingDown size={14} className="text-[#8B2635]" /> Barang Keluar
            </span>
          </div>

          <div className="w-full h-72">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-gray-400 animate-pulse">
                Memuat grafik...
              </div>
            ) : chartData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-400">
                <Activity size={28} className="mb-2 opacity-40" />
                <p className="text-sm font-semibold">
                  Belum ada pergerakan barang yang tercatat.
                </p>
                <p className="text-xs mt-1">
                  Data akan muncul saat ada pengajuan disetujui atau barang
                  masuk dari supplier.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE3D3" />
                  <XAxis
                    dataKey="tanggal"
                    tick={{ fontSize: 12, fill: "#8B7355" }}
                    stroke="#DAB88B"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#8B7355" }}
                    stroke="#DAB88B"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #DAB88B",
                      backgroundColor: "#FFFFFF",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="masuk"
                    name="Barang Masuk"
                    stroke="#2F7D5B"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="keluar"
                    name="Barang Keluar"
                    stroke="#8B2635"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* BARIS 3: Catatan Sistem & Grafik Kunjungan */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Catatan Sistem - Span 8 (pemberitahuan akun baru saat admin tidak aktif) */}
        <div className="xl:col-span-8 rounded-2xl border border-[#DAB88B]/30 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <UserPlus size={16} className="text-[#8B2635]" />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Catatan Sistem Terkini
              </p>
            </div>
            <button
              onClick={() => navigate("/pengguna")}
              className="text-xs font-semibold text-[#8B2635] hover:text-[#4A151E] transition flex items-center gap-1"
            >
              Lihat Semua <ArrowUpRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm font-semibold text-gray-400 animate-pulse">
              Memuat catatan...
            </div>
          ) : newAccounts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#DAB88B]/50 bg-[#FBF8F2] py-10 text-center">
              <p className="text-sm font-semibold text-[#4A151E]">
                Tidak ada pemberitahuan baru.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Belum ada akun yang dibuat sejak Anda terakhir keluar dari
                sistem.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl bg-[#4A151E] px-4 py-3 text-white flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#DAB88B] text-sm font-bold text-[#3A1019]">
                  {newAccounts.length}
                </span>
                <p className="text-sm font-semibold">
                  akun baru dibuat saat Anda tidak aktif
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {newAccounts.slice(0, 6).map((acc) => (
                  <div
                    key={acc.id}
                    className="rounded-xl border border-gray-100 bg-[#FBF8F2] p-4 hover:shadow-md hover:border-[#DAB88B]/50 transition duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Pengguna Baru
                      </p>
                      <span className="rounded-full bg-[#F4EFE6] px-2 py-0.5 text-[10px] font-bold text-[#8B2635]">
                        {formatRelativeTime(acc.created_at)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-bold text-[#4A151E] truncate">
                      {acc.nama_lengkap || "Tanpa Nama"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {acc.role || "-"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Grafik Kunjungan - Span 4 (komposisi pengguna yang masuk sistem) */}
        <div className="xl:col-span-4 rounded-2xl border border-[#DAB88B]/30 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ChartBar size={18} className="text-[#8B2635]" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Grafik Kunjungan
            </p>
          </div>

          <div className="flex-1 rounded-xl bg-[#FBF8F2] p-4 border border-gray-100 flex flex-col justify-center gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Pengguna Masuk Sistem
              </span>
              <span className="text-sm font-bold text-[#4A151E]">
                {loading ? "..." : `${stats?.totalPengguna ?? 0} akun`}
              </span>
            </div>

            {/* Bar Karyawan */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#4A151E]">
                  Karyawan
                </span>
                <span className="text-xs font-bold text-[#4A151E]">
                  {loading ? "..." : `${persenKaryawan}%`}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-[#EDE3D3] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#4A151E] transition-all duration-700"
                  style={{ width: `${loading ? 0 : persenKaryawan}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                {loading ? "" : `${stats?.totalKaryawan ?? 0} akun karyawan`}
              </p>
            </div>

            {/* Bar Supplier */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#4A151E]">
                  Supplier
                </span>
                <span className="text-xs font-bold text-[#4A151E]">
                  {loading ? "..." : `${persenSupplier}%`}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-[#EDE3D3] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#DAB88B] transition-all duration-700"
                  style={{ width: `${loading ? 0 : persenSupplier}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                {loading ? "" : `${stats?.totalSupplier ?? 0} akun supplier`}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
