import React, { useState, useEffect, useMemo } from "react";
import { kelolaBarangController } from "../../controllers/admin/KelolaBarangController";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  AlertTriangle,
  ChevronRight,
  Inbox,
  Layers,
  CheckCircle2,
  Truck,
} from "lucide-react";

export default function KelolaBarang() {
  const opsiLokasi = [
    "Blok A (Lemari Kunci Depan)",
    "Blok B (Lemari Kayu Belakang)",
    "Blok C (Rak Besi Heavy-Duty)",
    "Lantai Sektor 1 (Area Palet Pupuk)",
    "Lantai Sektor 2 (Area Transit Depan)",
  ];
  const kategoriDefault = ["Pupuk", "Pestisida", "Alat Kerja", "Umum"];
  const MANUAL_OPTION = "__manual__";

  const [barangList, setBarangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState([]); // pengiriman supplier yang berhasil (status Selesai)
  const [formData, setFormData] = useState({
    id_sku: "",
    nama_barang: "",
    kategori: "Pupuk",
    stok: "",
    lokasi_penyimpanan: opsiLokasi[0],
    keterangan: "",
  });
  const [namaManual, setNamaManual] = useState(false); // toggle input manual nama barang
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [selectedDeliveryIds, setSelectedDeliveryIds] = useState([]); // batch pengiriman terpilih (untuk ditandai "sudah_ditambahkan")

  const totalStok = barangList.reduce(
    (acc, curr) => acc + (parseInt(curr.stok) || 0),
    0,
  );

  // Nama barang unik dari pengiriman supplier yang sukses (status "Selesai")
  const namaBarangOptions = useMemo(() => {
    const set = new Set(deliveries.map((d) => d.nama_barang).filter(Boolean));
    return Array.from(set);
  }, [deliveries]);

  // Kategori: gabungan kategori yang sudah pernah dipakai + daftar dasar
  const kategoriOptions = useMemo(() => {
    const dariBarang = barangList.map((b) => b.kategori).filter(Boolean);
    return Array.from(new Set([...kategoriDefault, ...dariBarang]));
  }, [barangList]);

  const triggerNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const loadBarangData = async () => {
    try {
      setLoading(true);
      const data = await kelolaBarangController.fetchBarangList();
      setBarangList(data);
    } catch (err) {
      triggerNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveries = async () => {
    try {
      const data = await kelolaBarangController.fetchSuccessfulDeliveries();
      setDeliveries(Array.isArray(data) ? data : []);
    } catch {
      setDeliveries([]);
    }
  };

  useEffect(() => {
    loadBarangData();
    loadDeliveries();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Saat admin memilih Nama Barang dari dropdown pengiriman supplier:
  // Kategori & Jumlah Stok langsung terisi OTOMATIS, admin tidak perlu
  // memilih/mengetik ulang. Jumlah Stok = total dari semua batch pengiriman
  // dengan nama barang yang sama (yang belum pernah dimasukkan ke inventori).
  // Kategori mengikuti data barang yang sudah ada (kalau nama ini sudah
  // pernah tersimpan sebelumnya), supaya konsisten.
  const handleNamaBarangSelect = (e) => {
    const value = e.target.value;
    if (value === MANUAL_OPTION) {
      setNamaManual(true);
      setSelectedDeliveryIds([]);
      setFormData((prev) => ({ ...prev, nama_barang: "", stok: "" }));
      return;
    }
    setNamaManual(false);

    const matchingBatches = deliveries.filter((d) => d.nama_barang === value);
    const totalJumlah = matchingBatches.reduce((sum, b) => sum + (parseInt(b.jumlah) || 0), 0);
    const existing = kelolaBarangController.findBarangByNama(barangList, value);

    setSelectedDeliveryIds(matchingBatches.map((b) => b.id));
    setFormData((prev) => ({
      ...prev,
      nama_barang: value,
      stok: totalJumlah || "",
      kategori: existing ? existing.kategori : prev.kategori,
      lokasi_penyimpanan: existing ? existing.lokasi_penyimpanan : prev.lokasi_penyimpanan,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validasi form
    if (!formData.nama_barang.trim() || !formData.stok) {
      triggerNotification("Silakan isi semua field yang diperlukan.", "error");
      return;
    }
    // Tampilkan modal konfirmasi. Simpan juga id batch pengiriman terpilih
    // (kalau ada) supaya bisa ditandai "sudah_ditambahkan" setelah tersimpan.
    setPendingFormData({
      ...formData,
      _deliveryIds: !isEditing && !namaManual ? selectedDeliveryIds : [],
    });
    setShowConfirmation(true);
  };

  const handleConfirmSave = async () => {
    if (isSaving) return; // cegah klik dobel saat masih proses simpan
    setIsSaving(true);
    try {
      const { _deliveryIds, ...dataToSave } = pendingFormData;
      const result = await kelolaBarangController.handleSaveBarang(
        dataToSave,
        isEditing,
        barangList,
      );

      // Tandai semua batch pengiriman yang dipakai supaya hilang dari
      // dropdown pada form berikutnya (mencegah stok yang sama dihitung dua kali).
      if (_deliveryIds && _deliveryIds.length > 0) {
        try {
          await Promise.all(_deliveryIds.map((id) => kelolaBarangController.markDeliveryUsed(id)));
        } catch {
          // Non-blocking: penyimpanan barang tetap dianggap berhasil.
        }
      }

      triggerNotification(result.message, "success");
      await loadBarangData();
      await loadDeliveries();
      setFormData({
        id_sku: "",
        nama_barang: "",
        kategori: "Pupuk",
        stok: "",
        lokasi_penyimpanan: opsiLokasi[0],
        keterangan: "",
      });
      setNamaManual(false);
      setSelectedDeliveryIds([]);
      setIsEditing(false);
      setShowForm(false);
      setShowConfirmation(false);
      setPendingFormData(null);
    } catch (err) {
      triggerNotification(err.message, "error");
      setShowConfirmation(false);
      setPendingFormData(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSave = () => {
    setShowConfirmation(false);
    setPendingFormData(null);
  };

  const handleEdit = (item) => {
    setFormData(item);
    // Saat mengedit barang yang sudah ada, gunakan mode manual langsung
    // karena nilainya sudah tersimpan persis di database.
    setNamaManual(true);
    setSelectedDeliveryIds([]);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id_sku) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus data barang ini dari cloud database?",
      )
    ) {
      try {
        const result = await kelolaBarangController.handleDeleteBarang(id_sku);
        triggerNotification(result.message, "warning");
        loadBarangData();
      } catch (err) {
        triggerNotification(err.message, "error");
      }
    }
  };

  return (
    <div className="relative h-full w-full font-sans overflow-hidden rounded-4xl bg-[#F4EFE6] text-[#4A151E]">
      <div className="relative z-10 h-full w-full p-6 lg:p-8 flex flex-col overflow-y-auto no-scrollbar">

        {/* NOTIFICATION POP-UP */}
        {notification && (
          <div className="fixed inset-0 bg-[#4A151E]/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-4xl p-6 max-w-md w-full shadow-2xl border border-[#DAB88B] text-center flex flex-col items-center">
              <div
                className={`p-4 rounded-full mb-4 ${
                  notification.type === "error"
                    ? "bg-red-100 text-red-600"
                    : notification.type === "warning"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-[#F4EFE6] text-[#4A151E]"
                }`}
              >
                {notification.type === "error" && <AlertTriangle size={36} strokeWidth={2.5} />}
                {notification.type === "warning" && <Trash2 size={36} strokeWidth={2.5} />}
                {notification.type === "success" && <CheckCircle2 size={36} strokeWidth={2.5} />}
              </div>
              <h4 className="text-xs font-black tracking-widest uppercase mb-2 text-[#4A151E]">
                {notification.type === "error"
                  ? "Gagal Sistem"
                  : notification.type === "warning"
                    ? "Aksi Hapus"
                    : "Sistem Berhasil"}
              </h4>
              <p className="text-sm font-black text-[#4A151E] uppercase tracking-wide px-2 mb-6 leading-relaxed">
                {notification.message}
              </p>
              <button
                onClick={() => setNotification(null)}
                className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-md bg-[#4A151E]"
              >
                OKE
              </button>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
          <div className="bg-white p-4 rounded-3xl border border-[#DAB88B] shadow-sm w-full md:w-auto">
            <nav className="flex items-center gap-2 text-xs font-bold text-[#8B2635] uppercase tracking-wide mb-1">
              <span>Palmventory</span>
              <ChevronRight size={10} strokeWidth={3} />
              <span className="text-[#4A151E] font-bold">Logistics Cloud Database</span>
            </nav>
            <h2 className="text-3xl lg:text-4xl font-black text-[#4A151E] tracking-tighter">
              Kelola Barang
            </h2>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                setShowForm(true);
                setIsEditing(false);
                setNamaManual(false);
                setSelectedDeliveryIds([]);
              }}
              className="flex items-center gap-2 bg-[#4A151E] hover:bg-[#8B2635] text-white px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-transform active:scale-95"
            >
              <Plus size={16} strokeWidth={3} /> Tambah Barang Baru
            </button>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6 shrink-0">
          <MiniStatCard
            label="Total SKU Terdaftar"
            value={`${barangList.length} Items`}
            icon={<Package />}
            color="bg-[#4A151E]"
          />
          <MiniStatCard
            label="Akumulasi Stok Fisik"
            value={`${totalStok} Unit`}
            icon={<Layers />}
            color="bg-[#DAB88B]"
          />
        </div>

        <div className="flex-1 grid grid-cols-1 gap-6 min-h-0">
          {/* FORM MODAL POP-UP */}
          {showForm && (
            <div className="fixed inset-0 bg-[#4A151E]/60 backdrop-blur-sm z-40 flex justify-center items-center p-4 overflow-y-auto">
              <div className="bg-white p-8 rounded-[2.5rem] border border-[#DAB88B] shadow-2xl max-w-2xl w-full my-8">
                <div className="flex justify-between items-center mb-6 border-b border-[#F4EFE6] pb-4">
                  <h3 className="text-sm font-black text-[#4A151E] uppercase tracking-wider flex items-center gap-2">
                    <Package size={16} className="text-[#8B2635]" />
                    {isEditing ? "Ubah Informasi Barang" : "Form Input Barang Baru"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setIsEditing(false);
                      setNamaManual(false);
                      setSelectedDeliveryIds([]);
                      setFormData({
                        id_sku: "",
                        nama_barang: "",
                        kategori: "Pupuk",
                        stok: "",
                        lokasi_penyimpanan: opsiLokasi[0],
                        keterangan: "",
                      });
                    }}
                    className="text-[#8B2635] hover:text-[#4A151E] transition"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                {deliveries.length > 0 && (
                  <div className="flex items-start gap-2 rounded-xl bg-[#F4EFE6] border border-[#DAB88B]/50 px-4 py-3 text-[11px] text-[#4A151E]">
                    <Truck size={14} className="mt-0.5 shrink-0 text-[#8B2635]" />
                    <span>
                      Pilih <strong>Nama Barang</strong> dari daftar pengiriman supplier yang
                      <strong> berhasil (Selesai)</strong> — Kategori &amp; Jumlah Stok akan terisi
                      <strong> otomatis</strong>. Barang yang sudah pernah dimasukkan ke inventori
                      tidak akan muncul lagi di daftar ini. Pilih "Isi Manual" bila barang belum
                      pernah dikirim supplier.
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-[#8B2635] uppercase tracking-widest mb-2">
                      Nama Barang
                    </label>
                      <input
                        type="text"
                        name="nama_barang"
                        autoFocus
                        placeholder="Ketik nama barang..."
                        value={formData.nama_barang}
                        onChange={handleChange}
                        className="w-full bg-[#F4EFE6] text-[#4A151E] px-4 py-3 rounded-xl border border-transparent focus:border-[#DAB88B] text-xs font-bold"
                      />
                    {namaManual && namaBarangOptions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setNamaManual(false)}
                        className="mt-1.5 text-[10px] font-bold uppercase text-[#8B2635] hover:underline"
                      >
                        &larr; Pilih dari daftar pengiriman
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#8B2635] uppercase tracking-widest mb-2">
                      Kategori
                    </label>
                    <select
                      name="kategori"
                      value={formData.kategori}
                      onChange={handleChange}
                      className="w-full bg-[#F4EFE6] text-[#4A151E] px-4 py-3 rounded-xl border border-transparent focus:border-[#DAB88B] text-xs font-bold"
                    >
                      {kategoriOptions.map((kat) => (
                        <option key={kat} value={kat}>{kat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-[#8B2635] uppercase tracking-widest mb-2">
                      Jumlah Stok
                      {!namaManual && selectedDeliveryIds.length > 0 && (
                        <span className="ml-2 normal-case font-normal text-[10px] text-emerald-600">(otomatis terisi dari pengiriman)</span>
                      )}
                    </label>
                    <input
                      type="number"
                      name="stok"
                      value={formData.stok}
                      onChange={handleChange}
                      placeholder={namaManual ? "Ketik jumlah stok..." : "Ketik jumlah stok..."}
                      className="w-full bg-[#F4EFE6] text-[#4A151E] px-4 py-3 rounded-xl border border-transparent focus:border-[#DAB88B] text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#8B2635] uppercase tracking-widest mb-2">
                      Lokasi Penyimpanan
                    </label>
                    <select
                      name="lokasi_penyimpanan"
                      value={formData.lokasi_penyimpanan}
                      onChange={handleChange}
                      className="w-full bg-[#F4EFE6] text-[#4A151E] px-4 py-3 rounded-xl border border-transparent focus:border-[#DAB88B] text-xs font-bold"
                    >
                      {opsiLokasi.map((loc, i) => (
                        <option key={i} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#8B2635] uppercase tracking-widest mb-2">
                    Keterangan (opsional)
                  </label>
                  <textarea
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleChange}
                    rows="2"
                    className="w-full bg-[#F4EFE6] text-[#4A151E] px-4 py-3 rounded-xl border border-transparent focus:border-[#DAB88B] text-xs font-bold"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#F4EFE6]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setIsEditing(false);
                      setNamaManual(false);
                      setSelectedDeliveryIds([]);
                      setFormData({
                        id_sku: "",
                        nama_barang: "",
                        kategori: "Pupuk",
                        stok: "",
                        lokasi_penyimpanan: opsiLokasi[0],
                        keterangan: "",
                      });
                    }}
                    className="px-5 py-3 border border-[#DAB88B] text-[#4A151E] rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#F4EFE6] transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-[#4A151E] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:bg-[#8B2635] transition"
                  >
                    <Save size={14} /> Simpan Data
                  </button>
                </div>
              </form>
              </div>
            </div>
          )}

          {/* CONFIRMATION MODAL */}
          {showConfirmation && (
            <div className="fixed inset-0 bg-[#4A151E]/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
              <div className="bg-white rounded-4xl p-8 max-w-md w-full shadow-2xl border border-[#DAB88B] text-center flex flex-col items-center">
                <div className="p-4 rounded-full mb-4 bg-[#F4EFE6] text-[#4A151E]">
                  <AlertTriangle size={36} strokeWidth={2.5} />
                </div>
                <h4 className="text-xs font-black tracking-widest uppercase mb-2 text-[#4A151E]">
                  Verifikasi Penyimpanan
                </h4>
                <p className="text-sm font-bold text-[#4A151E] uppercase tracking-wide px-2 mb-2">
                  {isEditing ? "Ubah" : "Tambah"} Data Barang
                </p>
                <p className="text-xs text-gray-500 px-2 mb-6 leading-relaxed">
                  Apakah Anda yakin ingin menyimpan data barang dengan nama <strong className="text-[#4A151E]">{pendingFormData?.nama_barang}</strong>?
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleCancelSave}
                    disabled={isSaving}
                    className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-[#4A151E] bg-[#F4EFE6] hover:bg-[#EDE3D3] transition disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirmSave}
                    disabled={isSaving}
                    className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-md bg-[#4A151E] hover:bg-[#8B2635] transition disabled:opacity-50"
                  >
                    {isSaving ? "Menyimpan..." : "Ya, Simpan"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TABEL */}
          <div className="bg-white border border-[#DAB88B] rounded-[2.5rem] flex flex-col min-h-0 shadow-lg overflow-hidden">
            <div className="p-5 bg-[#4A151E] flex justify-between items-center shrink-0">
              <span className="text-xs font-black uppercase tracking-wide text-white">
                Daftar Inventori Aktif (Live Database)
              </span>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4EFE6] text-[#4A151E] text-xs font-black uppercase tracking-widest sticky top-0 z-10 shadow-sm">
                    <th className="px-6 py-5">ID SKU</th>
                    <th className="px-6 py-5">Nama Barang</th>
                    <th className="px-6 py-5">Kategori</th>
                    <th className="px-6 py-5">Stok Fisik</th>
                    <th className="px-6 py-5">Lokasi Penyimpanan</th>
                    <th className="px-6 py-5">Keterangan</th>
                    <th className="px-6 py-5 text-center bg-[#DAB88B]/20 text-[#4A151E]">
                      Aksi Manajemen
                    </th>
                  </tr>
                </thead>
                <tbody className="text-xs font-bold text-[#4A151E]">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-[#4A151E] bg-white animate-pulse">
                        Menghubungkan ke Cloud Supabase...
                      </td>
                    </tr>
                  ) : barangList.length > 0 ? (
                    barangList.map((item, index) => (
                      <tr
                        key={item.id_sku}
                        className={`border-b border-[#F4EFE6] ${index % 2 === 0 ? "bg-white" : "bg-[#F4EFE6]/30"}`}
                      >
                        <td className="px-6 py-4 text-[#8B2635] font-mono text-xs">{item.id_sku}</td>
                        <td className="px-6 py-4 font-black">{item.nama_barang}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-[#F4EFE6] text-[#8B2635]">
                            {item.kategori}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm font-black">{item.stok}</td>
                        <td className="px-6 py-4 text-xs tracking-wide font-black">{item.lokasi_penyimpanan}</td>
                        <td className="px-6 py-4 font-normal italic text-gray-400">{item.keterangan || "-"}</td>
                        <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F4EFE6] text-[#4A151E] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#DAB88B]"
                          >
                            <Edit2 size={10} strokeWidth={3} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id_sku)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-100"
                          >
                            <Trash2 size={10} strokeWidth={3} /> Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-[#4A151E] bg-white">
                        <Inbox className="mx-auto mb-2 text-[#DAB88B]" size={32} />
                        Belum ada data di database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ===== DAISY UI FAB - POJOK KANAN BAWAH DALAM CARD ===== */}
      <div className="absolute bottom-6 right-6 flex flex-col items-center gap-3 z-20">

        {/* Sub-buttons: muncul saat fabOpen = true */}
        {fabOpen && (
          <>
            <button className="btn btn-lg btn-circle bg-white border border-[#DAB88B] text-[#4A151E] hover:bg-[#F4EFE6] shadow-md">
              <svg
                aria-label="Voice"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                />
              </svg>
            </button>

            <button className="btn btn-lg btn-circle bg-white border border-[#DAB88B] text-[#4A151E] hover:bg-[#F4EFE6] shadow-md">
              <svg
                aria-label="Gallery"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </button>

            <button className="btn btn-lg btn-circle bg-white border border-[#DAB88B] text-[#4A151E] hover:bg-[#F4EFE6] shadow-md">
              <svg
                aria-label="Camera"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                />
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                />
              </svg>
            </button>
          </>
        )}

      </div>
    </div>
  );
}

const MiniStatCard = ({ label, value, icon, color }) => (
  <div className="bg-white p-4 rounded-3xl border border-[#DAB88B]/30 flex items-center gap-4 shadow-sm">
    <div className={`${color} p-3 rounded-xl text-white`}>
      {React.cloneElement(icon, { size: 18, strokeWidth: 2.5 })}
    </div>
    <div>
      <p className="text-[#8B2635] text-xs font-black uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <h4 className="text-lg font-black text-[#4A151E] tracking-tight">{value}</h4>
    </div>
  </div>
);