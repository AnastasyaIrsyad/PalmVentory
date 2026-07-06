import React, { useState, useEffect, useCallback } from "react";
import { pengajuanBarangController } from "../../controllers/karyawan/PengajuanBarangController";
import RejectionReasonModal from "../../components/RejectionReasonModal";
import { Loader2, Inbox, Send, History, Package, Search, MessageSquareWarning } from "lucide-react";

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function PengajuanBarang() {
  const currentUser = getCurrentUser();
  const namaKaryawanAktif = currentUser?.nama_lengkap || currentUser?.email || "";

  const [barangList, setBarangList] = useState([]);
  const [riwayatList, setRiwayatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // State untuk pencarian
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk form pengajuan barang yang dipilih
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [jumlahAmbil, setJumlahAmbil] = useState("");
  const [satuanAmbil, setSatuanAmbil] = useState("Pcs");

  // State untuk pop-up keterangan penolakan (klik status "Ditolak")
  const [selectedRejection, setSelectedRejection] = useState(null);

  const loadData = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) setLoading(true);
      setErrorMsg("");
      const res = await pengajuanBarangController.fetchKaryawanPageData(namaKaryawanAktif);
      setBarangList(res?.daftarBarang || []);
      setRiwayatList(res?.riwayatPengajuan || []);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [namaKaryawanAktif]);

  useEffect(() => {
    loadData(true);
    // Polling berkala supaya status pengajuan (disetujui/ditolak admin)
    // otomatis terlihat tanpa perlu reload manual halaman.
    const interval = setInterval(() => loadData(false), 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Filter data berdasarkan searchTerm
  const filteredBarang = barangList.filter((barang) =>
    barang.nama_barang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePilihBarang = (barang) => {
    setSelectedBarang(barang);
    setJumlahAmbil("");
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleSubmitPengajuan = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const detailForm = {
      id_sku: selectedBarang.id_sku,
      nama_barang: selectedBarang.nama_barang,
      jumlah: jumlahAmbil,
      satuan: satuanAmbil,
    };

    try {
      await pengajuanBarangController.handleAjukanBarang(namaKaryawanAktif, detailForm, selectedBarang.stok);
      setSuccessMsg(`Berhasil mengirim pengajuan untuk ${selectedBarang.nama_barang}! Menunggu konfirmasi Admin.`);
      setSelectedBarang(null);
      setJumlahAmbil("");
      loadData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center gap-2 text-sm text-gray-500">
        <Loader2 className="animate-spin" size={20} /> Memuat data inventaris...
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto pr-1 flex flex-col gap-6 pb-6">
      {errorMsg && <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-200">{errorMsg}</div>}
      {successMsg && <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200">{successMsg}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-[#DAB88B]/30 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#4A151E]">
                <Package size={20} />
                <h3 className="text-lg font-bold">Stok Barang Gudang</h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Pilih barang untuk pengajuan.</p>
            </div>
            
            {/* Input Pencarian */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-[#4A151E]" size={16} />
              <input
                type="text"
                placeholder="Cari nama barang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-[#DAB88B]/40 rounded-xl text-sm outline-none 
                text-[#4A151E] placeholder:text-gray-400 
                focus:border-[#4A151E] focus:ring-2 focus:ring-[#4A151E]/20 
                w-full sm:w-64 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100">
                  <th className="py-3 pr-4">Nama Barang</th>
                  <th className="py-3 pr-4">Kategori</th>
                  <th className="py-3 pr-4">Stok</th>
                  <th className="py-3 pr-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredBarang.length > 0 ? (
                  filteredBarang.map((barang) => (
                    <tr key={barang.id_sku} className="border-b border-gray-50 hover:bg-[#FBF8F2] transition">
                      <td className="py-3.5 pr-4 text-sm font-semibold text-[#4A151E]">{barang.nama_barang}</td>
                      <td className="py-3.5 pr-4 text-sm text-gray-600">{barang.kategori}</td>
                      <td className="py-3.5 pr-4 text-sm font-bold">
                        <span className={`px-2.5 py-1 rounded-full text-xs ${barang.stok > 10 ? 'bg-gray-100 text-gray-700' : 'bg-orange-50 text-orange-700'}`}>
                          {barang.stok} Unit
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <button 
                          onClick={() => handlePilihBarang(barang)}
                          disabled={barang.stok <= 0}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition ${barang.stok <= 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#4A151E] text-white hover:bg-[#3a1018]'}`}
                        >
                          {barang.stok <= 0 ? "Stok Habis" : "Pilih Barang"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-sm text-gray-400 italic">Barang tidak ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* FORM PENGAJUAN (KANAN) */}
        <section className="rounded-2xl border border-[#DAB88B]/30 bg-[#FBF8F2] p-6 shadow-sm h-fit">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-[#4A151E]">
              <Send size={18} />
              <h4 className="text-base font-bold">Form Permintaan Barang</h4>
            </div>
          </div>

          {selectedBarang ? (
            <form onSubmit={handleSubmitPengajuan} className="flex flex-col gap-4">
              <div className="p-3 bg-white rounded-xl border border-[#DAB88B]/30 text-sm">
                <span className="text-gray-400 block text-xs">Barang Terpilih:</span>
                <span className="font-bold text-[#4A151E]">{selectedBarang.nama_barang}</span>
                <span className="text-gray-500 text-xs block mt-1">Stok Gudang saat ini: {selectedBarang.stok} unit</span>
              </div>

              <div className="flex flex-col gap-1.5 text-sm">
                <label className="font-semibold text-[#4A151E]">Jumlah Pengambilan</label>
                <input 
                  type="number"
                  min="1"
                  max={selectedBarang.stok}
                  value={jumlahAmbil}
                  onChange={(e) => setJumlahAmbil(e.target.value)}
                  placeholder={`Maksimal ${selectedBarang.stok}`}
                  className="w-full rounded-xl border border-[#DAB88B]/40 bg-white px-4 py-2.5 outline-none focus:border-[#4A151E] focus:ring-2 focus:ring-[#DAB88B]/30 text-gray-700"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 text-sm">
                <label className="font-semibold text-[#4A151E]">Satuan</label>
                <select
                  value={satuanAmbil}
                  onChange={(e) => setSatuanAmbil(e.target.value)}
                  className="w-full rounded-xl border border-[#DAB88B]/40 bg-white px-4 py-2.5 outline-none focus:border-[#4A151E] text-gray-700"
                >
                  <option value="Pcs">Pcs / Unit</option>
                  <option value="Karung">Karung</option>
                  <option value="Liter">Liter</option>
                  <option value="Kg">Kg</option>
                </select>
              </div>

              <div className="flex gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedBarang(null)}
                  className="w-1/3 rounded-xl border border-[#4A151E] text-[#4A151E] py-2.5 font-semibold text-xs hover:bg-white/50 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="w-2/3 rounded-xl bg-[#4A151E] text-white py-2.5 font-semibold text-xs hover:bg-[#3a1018] shadow-sm transition"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12 text-gray-400 border border-dashed border-[#DAB88B]/50 rounded-xl bg-white/50">
              <p className="text-xs">Silakan pilih barang terlebih dahulu dari tabel di sebelah kiri.</p>
            </div>
          )}
        </section>
      </div>

      {/* TABEL STATUS RIWAYAT PENGAJUAN (BAWAH) */}
      <section className="rounded-2xl border border-[#DAB88B]/30 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-[#4A151E]">
          <History size={20} />
          <h3 className="text-lg font-bold">Riwayat Pengajuan Kamu</h3>
        </div>

        {riwayatList.length === 0 ? (
          <div className="text-center py-10">
            <Inbox className="mx-auto mb-2 text-[#DAB88B]" size={32} />
            <p className="text-sm text-gray-400">Kamu belum pernah mengajukan barang.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100">
                  <th className="py-3 pr-4">Kode</th>
                  <th className="py-3 pr-4">Nama Barang</th>
                  <th className="py-3 pr-4">Tanggal Pengajuan</th>
                  <th className="py-3 pr-4">Tanggal Balasan</th>
                  <th className="py-3 pr-4">Jumlah Pengajuan</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Keterangan Admin</th>
                </tr>
              </thead>
              <tbody>
                {riwayatList.map((item) => (
                  <tr key={item?.id || item?.kode_permintaan} className="border-b border-gray-50 hover:bg-[#FBF8F2] transition">
                    <td className="py-3.5 pr-4 text-sm font-semibold text-gray-500">{item?.kode_permintaan || "-"}</td>
                    <td className="py-3.5 pr-4 text-sm font-semibold text-[#4A151E]">{item?.nama_barang || "-"}</td>
                    
                    {/* Menggunakan tgl_kirim atau fallback ke created_at */}
                    <td className="py-3.5 pr-4 text-sm text-gray-600">
                      {item?.tgl_kirim || item?.created_at?.split("T")[0] || "-"}
                    </td>

                    {/* Menggunakan tgl_terima saat admin setujui/tolak */}
                    <td className="py-3.5 pr-4 text-sm text-gray-500 font-medium">
                      {item?.tgl_terima ? item.tgl_terima : (
                        <span className="text-amber-500 text-xs italic font-normal">Menunggu...</span>
                      )}
                    </td>

                    <td className="py-3.5 pr-4 text-sm text-gray-600">{item?.jumlah} {item?.satuan}</td>
                    <td className="py-3.5 pr-4 text-sm">
                      {item?.status === "Ditolak" ? (
                        <button
                          onClick={() => setSelectedRejection(item)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 transition cursor-pointer"
                        >
                          <MessageSquareWarning size={12} /> Ditolak
                        </button>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          item?.status === 'Disetujui' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {item?.status || "Pending"}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pr-4 text-xs italic text-gray-500">
                      {item?.status === "Ditolak" ? (
                        <button
                          onClick={() => setSelectedRejection(item)}
                          className="not-italic font-semibold text-[#8B2635] hover:underline"
                        >
                          Lihat keterangan &rarr;
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedRejection && (
        <RejectionReasonModal item={selectedRejection} onClose={() => setSelectedRejection(null)} />
      )}
    </div>
  );
}