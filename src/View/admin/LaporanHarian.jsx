import React, { useState, useEffect } from "react";
import { Inbox, Calendar, ChevronRight, Search, Printer, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { laporanHarianController } from "../../controllers/admin/LaporanHarianController";

export default function LaporanHarian() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [filterBy, setFilterBy] = useState("nama");
  const [dateQuery, setDateQuery] = useState("");

  const getHariIniFormat = () => {
    const opsi = { year: "numeric", month: "long", day: "numeric" };
    return new Date().toLocaleDateString("id-ID", opsi).toUpperCase();
  };

  const getTanggalCetakFormat = () => {
    const opsi = { day: "numeric", month: "long", year: "numeric" };
    return new Date().toLocaleDateString("id-ID", opsi).toUpperCase();
  };

  const getCurrentUserName = () => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return "Admin";
      const parsedUser = JSON.parse(rawUser);
      return parsedUser?.nama_lengkap || parsedUser?.name || parsedUser?.email || "Admin";
    } catch {
      return "Admin";
    }
  };

  // AMBIL DATA DARI SUPABASE VIA MODEL
  const loadLaporanData = async () => {
    try {
      setLoading(true);
      const data = await laporanHarianController.fetchAllLaporan();

      // Transformasi data untuk memproses perhitungan stok akhir dan status secara live
      const processedData = data.map((item) => {
        const namaBarang = item.barang?.nama_barang || "Tanpa Nama";
        const kategoriBarang = item.barang?.kategori || "Umum";

        const barangMasuk = parseInt(item.barang_masuk) || 0;
        const barangKeluar = parseInt(item.barang_keluar) || 0;

        // stok_akhir = snapshot sisa stok TEPAT SETELAH baris transaksi ini
        // terjadi (dicatat saat transaksi dibuat). Baris laporan lama yang
        // belum punya snapshot (sebelum migrasi kolom ini) fallback ke stok
        // gudang saat ini supaya tetap tampil, bukan kosong/NaN.
        const stokAkhir =
          item.stok_akhir !== null && item.stok_akhir !== undefined
            ? parseInt(item.stok_akhir) || 0
            : parseInt(item.barang?.stok) || 0;
        const stokAwal = stokAkhir + barangKeluar - barangMasuk;

        const status = stokAkhir === 0 
          ? "Habis" 
          : stokAkhir < 10 
            ? "Menipis" 
            : "Tersedia";
        const tanggalFormat = item.created_at
          ? item.created_at.split("T")[0]
          : "";

        // Tentukan tipe aksi dan jumlah muatan
        let tipeAksi = "Masuk";
        let jumlahAksi = barangMasuk;

        if (barangKeluar > 0) {
          tipeAksi = "Keluar";
          jumlahAksi = barangKeluar;
        }

        return {
          id: item.id_sku,
          id_laporan: item.id_laporan,
          nama: namaBarang,
          kategori: kategoriBarang,
          stokAwal: stokAwal,
          tipe: tipeAksi,
          jumlah: jumlahAksi,
          stokAkhir: stokAkhir,
          status: status,
          tgl: tanggalFormat,
        };
      });

      setReports(processedData);
      setFilteredReports(processedData);
    } catch (err) {
      setError(err.message || "Gagal memuat data laporan dari cloud.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLaporanData();
  }, []);

  // FITUR PENCARIAN & FILTER DATA
  useEffect(() => {
    const filtered = reports.filter((data) => {
      if (filterBy === "nama")
        return data.nama.toLowerCase().includes(query.toLowerCase());
      if (filterBy === "kode")
        return data.id.toLowerCase().includes(query.toLowerCase());
      if (filterBy === "tanggal")
        return !dateQuery ? true : data.tgl === dateQuery;
      return true;
    });
    setFilteredReports(filtered);
  }, [query, filterBy, dateQuery, reports]);

  return (
    <>
      <style>{`
        /* ===== TAMPILAN CETAK (PRINT) LAPORAN ===== */
        .printable-report { display: none; }

        @media print {
          @page {
            size: A4 portrait;
            margin: 1.4cm 1.2cm;
          }

          aside, nav, header, .no-print, button, select, input {
            display: none !important;
          }

          html, body, #root, #app-container, #main-content, main {
            background: #ffffff !important;
            color: #000000 !important;
            overflow: visible !important;
            height: auto !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .printable-report {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11px !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .printable-report * {
            color: #000000 !important;
          }

          .printable-report table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          .printable-report thead th {
            background: #EFE7D6 !important;
            color: #000000 !important;
            font-weight: 800 !important;
            border: 1px solid #000000 !important;
            padding: 6px 8px !important;
            text-align: left;
          }

          .printable-report tbody td {
            border: 1px solid #444444 !important;
            padding: 5px 8px !important;
          }

          .printable-report tr { break-inside: avoid; }
          .printable-report thead { display: table-header-group; }

          .animate-pulse { animation: none !important; }
        }
      `}</style>

      {/* TAMPILAN TERLIHAT DI WEB (NO-PRINT) */}
      <div className="relative h-full w-full font-sans overflow-hidden rounded-4xl bg-[#FDFBF7] text-[#4A151E] no-print">
        <div className="relative z-10 h-full w-full p-6 lg:p-8 flex flex-col space-y-3">
          
          {/* HEADER UTAMA */}
          <div className="flex flex-col md:flex-row justify-between items-end shrink-0">
            <div className="bg-white p-4 rounded-3xl border border-[#DAB88B]/30 shadow-md w-full md:w-auto">
              <nav className="flex items-center gap-2 text-xs font-bold text-[#8B2635] uppercase tracking-wide mb-1">
                <span>Palmventory</span>
                <ChevronRight size={10} strokeWidth={3} />
                <span className="text-[#4A151E] font-bold">Laporan Harian</span>
              </nav>
              <h2 className="text-3xl lg:text-4xl font-black text-[#4A151E] tracking-tighter">
                Laporan Harian
              </h2>
            </div>

            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-[#8B2635] px-4 py-3 rounded-2xl border border-[#DAB88B]/30 text-white font-black text-xs uppercase tracking-wide shadow-md transition hover:bg-[#6f1f2b]"
              >
                <Printer size={16} />
                Print Laporan
              </button>

              <div className="flex items-center gap-2 bg-[#F4EFE6] px-5 py-3 rounded-2xl border border-[#DAB88B]/30 text-[#4A151E] font-black text-xs shadow-md">
                <Calendar size={18} className="text-[#8B2635]" />
                {getHariIniFormat()}
              </div>
            </div>
          </div>

          {/* BAR DATA FILTER */}
          <div className="flex flex-col md:flex-row gap-4 shrink-0">
            <div className="w-full md:w-1/4">
              <select
                value={filterBy}
                onChange={(e) => {
                  setFilterBy(e.target.value);
                  setQuery("");
                  setDateQuery("");
                }}
                className="w-full p-4 bg-white rounded-2xl border border-[#DAB88B]/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#DAB88B] font-black text-xs text-[#4A151E] uppercase tracking-wider cursor-pointer"
              >
                <option value="nama">Filter: Nama Barang</option>
                <option value="kode">Filter: ID SKU</option>
                <option value="tanggal">Filter: Tanggal Berjalan</option>
              </select>
            </div>

            <div className="flex-1 relative">
              {filterBy !== "tanggal" ? (
                <>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Cari berdasarkan ${filterBy === "nama" ? "nama barang" : "ID SKU"}...`}
                    className="w-full p-4 pl-12 bg-white rounded-2xl border border-[#DAB88B]/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#DAB88B] font-medium text-sm text-[#4A151E]"
                  />
                  <Search
                    className="absolute left-4 top-4 text-[#DAB88B]"
                    size={20}
                  />
                </>
              ) : (
                <>
                  <input
                    type="date"
                    value={dateQuery}
                    onChange={(e) => setDateQuery(e.target.value)}
                    className="w-full p-4 pl-12 bg-white rounded-2xl border border-[#DAB88B]/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#DAB88B] font-bold text-sm text-[#4A151E] cursor-pointer"
                  />
                  <Calendar
                    className="absolute left-4 top-4 text-[#DAB88B]"
                    size={20}
                  />
                </>
              )}
            </div>
          </div>

          {/* TAB CONTROLLERS */}
          <div className="flex gap-3 bg-[#F4EFE6]/50 p-2 rounded-2xl border border-[#DAB88B]/30 overflow-x-auto shrink-0">
            <button className="flex items-center gap-2 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all bg-[#4A151E] text-white shadow-md">
              Inventori Barang (Live Data)
            </button>
          </div>

          {/* CONTAINER TABEL */}
          <div className="flex-1 bg-white rounded-3xl border border-[#DAB88B]/30 shadow-xl overflow-y-auto min-h-0">
            {loading ? (
              <div className="p-16 text-center text-[#4A151E] animate-pulse font-bold">
                Menghubungkan ke Cloud Database Laporan...
              </div>
            ) : error ? (
              <div className="p-16 text-center text-red-600 font-bold">
                {error}
              </div>
            ) : filteredReports.length > 0 ? (
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-[#4A151E] text-[#DAB88B]">
                  <tr className="text-xs font-black uppercase tracking-widest text-left">
                    <th className="p-4">ID SKU</th>
                    <th className="p-4">Nama Barang</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Tanggal Aksi</th>
                    <th className="p-4 text-center">Aksi Barang</th>
                    <th className="p-4 text-center">Stok Akhir</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFE6] text-xs font-bold text-[#4A151E]">
                  {filteredReports.map((item) => (
                    <tr key={item.id_laporan} className="hover:bg-[#F4EFE6]/40 transition">
                      <td className="p-4 font-mono text-[#DAB88B]">{item.id}</td>
                      <td className="p-4 font-black">{item.nama}</td>
                      <td className="p-4 uppercase text-xs tracking-widest">{item.kategori}</td>
                      <td className="p-4">{item.tgl || "-"}</td>
                      
                      {/* KOLOM AKSI BARANG GABUNGAN */}
                      <td className="p-4 text-center">
                        {item.tipe === "Keluar" ? (
                          <div className="inline-flex items-center gap-1 font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                            <ArrowUpRight size={13} strokeWidth={2.5} />
                            <span>-{item.jumlah}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            <ArrowDownLeft size={13} strokeWidth={2.5} />
                            <span>+{item.jumlah}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-center font-black text-sm">{item.stokAkhir}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                            item.status === "Tersedia"
                              ? "bg-[#F4EFE6] text-[#4A151E]"
                              : "bg-red-100 text-red-600 animate-pulse"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center text-[#4A151E]">
                <Inbox size={40} className="mx-auto mb-2 text-[#DAB88B]" />
                <h3 className="font-black uppercase">Tidak Ada Data Laporan</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== STRUKTUR ELEMEN KERTAS BARU SAAT DI-PRINT ===== */}
      <div className="printable-report">
        {/* KOP LAPORAN */}
        <div style={{ borderBottom: "2px solid #000", paddingBottom: "10px", marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase" }}>
                PALMVENTORY
              </p>
              <p style={{ fontSize: "10px" }}>Sistem Manajemen Gudang Kelapa Sawit</p>
            </div>
            <div style={{ textAlign: "right", fontSize: "10px" }}>
              <p>Tanggal Cetak: {getTanggalCetakFormat()}</p>
              <p>Dicetak oleh: {getCurrentUserName()}</p>
            </div>
          </div>
          <h1 style={{ textAlign: "center", fontSize: "16px", fontWeight: 800, marginTop: "10px", textTransform: "uppercase" }}>
            Laporan Harian Perputaran Stok Inventori
          </h1>
        </div>

        {/* RINGKASAN */}
        <table style={{ width: "100%", marginBottom: "12px", fontSize: "11px" }}>
          <tbody>
            <tr>
              <td style={{ padding: "2px 0", width: "20%" }}><strong>Total Item Tercatat</strong></td>
              <td style={{ padding: "2px 0", width: "30%" }}>: {filteredReports.length} item</td>
              <td style={{ padding: "2px 0", width: "20%" }}><strong>Total Mutasi Masuk</strong></td>
              <td style={{ padding: "2px 0", width: "30%" }}>: {filteredReports.filter(i => i.tipe === "Masuk").reduce((sum, item) => sum + item.jumlah, 0)} unit</td>
            </tr>
            <tr>
              <td style={{ padding: "2px 0" }}><strong>Filter Aktif</strong></td>
              <td style={{ padding: "2px 0" }}>
                : {filterBy === "tanggal"
                    ? (dateQuery || "Semua tanggal")
                    : (query ? `${filterBy} = "${query}"` : "Semua data")}
              </td>
              <td style={{ padding: "2px 0" }}><strong>Total Mutasi Keluar</strong></td>
              <td style={{ padding: "2px 0" }}>: {filteredReports.filter(i => i.tipe === "Keluar").reduce((sum, item) => sum + item.jumlah, 0)} unit</td>
            </tr>
          </tbody>
        </table>

        {/* TABEL DATA PRINT MODE */}
        <table>
          <thead>
            <tr>
              <th style={{ width: "5%", textAlign: "center" }}>No</th>
              <th style={{ width: "15%" }}>ID SKU</th>
              <th style={{ width: "25%" }}>Nama Barang</th>
              <th style={{ width: "15%" }}>Kategori</th>
              <th style={{ width: "12%" }}>Tanggal Aksi</th>
              <th style={{ textAlign: "center", width: "13%" }}>Aksi Barang</th>
              <th style={{ textAlign: "center", width: "15%" }}>Stok Akhir</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "12px" }}>
                  Tidak ada data laporan pada filter ini.
                </td>
              </tr>
            ) : (
              filteredReports.map((item, idx) => (
                <tr key={item.id_laporan}>
                  <td style={{ textAlign: "center" }}>{idx + 1}</td>
                  <td>{item.id}</td>
                  <td style={{ fontWeight: 700 }}>{item.nama}</td>
                  <td>{item.kategori}</td>
                  <td>{item.tgl || "-"}</td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>
                    {item.tipe === "Keluar" ? `-${item.jumlah}` : `+${item.jumlah}`}
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 700, fontSize: "11px" }}>{item.stokAkhir}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* TANDA TANGAN */}
        <div style={{ marginTop: "36px", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "240px", fontSize: "11px", textAlign: "center" }}>
            <p style={{ textAlign: "left" }}>Pekanbaru, {getTanggalCetakFormat()}</p>
            <p style={{ textAlign: "left", marginTop: "2px" }}>Penanggung Jawab,</p>
            <div style={{ height: "60px" }} />
            <p style={{ fontWeight: 800, borderTop: "1px solid #000", paddingTop: "4px" }}>
              {getCurrentUserName()}
            </p>
            <p style={{ color: "#555555" }}>Admin / Pemilik Kebun</p>
          </div>
        </div>
      </div>
    </>
  );
}