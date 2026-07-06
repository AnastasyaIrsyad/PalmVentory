import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Wifi, PackageCheck, Loader2, MapPin, PackagePlus, CheckCircle2, MessageSquareWarning } from "lucide-react";
import { dataPengajuanController } from "../controllers/admin/DataPengajuanController";
import { pengajuanBarangController } from "../controllers/karyawan/PengajuanBarangController";
import { supplierDashboardController } from "../controllers/supplier/SupplierDashboardController";
import { PESANAN_STATUS } from "../utils/pesananStatus";
import SupplierArrivalModal from "./SupplierArrivalModal";
import NotificationModal from "./NotificationModal";
import PengajuanNotifDetailModal from "./PengajuanNotifDetailModal";

// Kunci localStorage untuk menyimpan id pengajuan karyawan yang sudah
// pernah "dilihat" notifikasinya, supaya notif yang sudah dibuka tidak
// terus muncul di badge lonceng setiap kali halaman dimuat ulang.
const getSeenPengajuanIds = (userKey) => {
  try {
    const raw = localStorage.getItem(`pv_seen_pengajuan_${userKey}`);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const markPengajuanSeen = (userKey, id) => {
  try {
    const current = getSeenPengajuanIds(userKey);
    if (!current.includes(id)) {
      const updated = [...current, id];
      localStorage.setItem(`pv_seen_pengajuan_${userKey}`, JSON.stringify(updated));
    }
  } catch {
    // abaikan jika localStorage tidak tersedia
  }
};

// Ambil data pengguna yang sedang login dari localStorage
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
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
};

export default function Header({ title = "Palmventory", breadcrumb }) {
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const account = getCurrentUser();
  const displayName = account?.nama_lengkap || "Pengguna";
  const displayRole = account?.role || "Belum Masuk";
  const initial = displayName.trim().charAt(0).toUpperCase() || "P";
  const isAdmin = !!displayRole && displayRole.includes("Admin");
  const isSupplier = !!displayRole && displayRole.includes("Supplier");
  const isKaryawan = !!displayRole && displayRole.includes("Karyawan");
  const userKey = account?.id || account?.email || displayName;

  const [sampai, setSampai] = useState([]);
  const [permintaanBaru, setPermintaanBaru] = useState([]); // notif supplier: pesanan baru dari admin
  const [responPengajuan, setResponPengajuan] = useState([]); // notif karyawan: pengajuan barang sudah direspons admin
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // item yang lagi dibuka pop-up-nya
  const [selectedRespon, setSelectedRespon] = useState(null); // detail respon pengajuan karyawan yang dibuka
  const [notification, setNotification] = useState(null);

  const loadNotif = useCallback(async () => {
    if (isAdmin) {
      try {
        setLoadingNotif(true);
        const data = await dataPengajuanController.fetchPesananSampai();
        setSampai(Array.isArray(data) ? data : []);
      } catch {
        setSampai([]);
      } finally {
        setLoadingNotif(false);
      }
      return;
    }

    if (isSupplier) {
      try {
        setLoadingNotif(true);
        const data = await supplierDashboardController.fetchPesanan(account?.id, account?.nama_lengkap);
        const baru = (Array.isArray(data) ? data : []).filter(
          (o) => o.status === PESANAN_STATUS.MENUNGGU,
        );
        setPermintaanBaru(baru);
      } catch {
        setPermintaanBaru([]);
      } finally {
        setLoadingNotif(false);
      }
      return;
    }

    if (isKaryawan) {
      try {
        setLoadingNotif(true);
        const data = await pengajuanBarangController.fetchRiwayatKaryawan(displayName);
        const seenIds = getSeenPengajuanIds(userKey);
        const sudahDirespon = (Array.isArray(data) ? data : []).filter(
          (item) =>
            (item.status === "Disetujui" || item.status === "Ditolak") &&
            !seenIds.includes(item.id),
        );
        setResponPengajuan(sudahDirespon);
      } catch {
        setResponPengajuan([]);
      } finally {
        setLoadingNotif(false);
      }
    }
  }, [isAdmin, isSupplier, isKaryawan, account?.id, account?.nama_lengkap, displayName, userKey]);

  useEffect(() => {
    loadNotif();
    if (!isAdmin && !isSupplier && !isKaryawan) return;
    // Poll berkala agar notifikasi selalu terkini tanpa perlu reload manual
    const interval = setInterval(loadNotif, 20000);
    return () => clearInterval(interval);
  }, [loadNotif, isAdmin, isSupplier, isKaryawan]);

  // Tutup dropdown notifikasi otomatis saat mengklik area lain di luar lonceng
  useEffect(() => {
    if (!isNotifOpen) return;
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotifOpen]);

  const handleAccept = async (item) => {
    try {
      const res = await dataPengajuanController.confirmSupplierReceived(item);
      setSelectedItem(null);
      setNotification({ message: res.message, type: "success" });
      setSampai((prev) => prev.filter((x) => x.id !== item.id));
    } catch (err) {
      setNotification({ message: err.message || "Gagal mengkonfirmasi penerimaan barang.", type: "error" });
    }
  };

  const handleReject = async (item, alasan) => {
    try {
      const res = await dataPengajuanController.rejectSupplierDelivery(item, alasan);
      setSelectedItem(null);
      setNotification({ message: res.message, type: "warning" });
      setSampai((prev) => prev.filter((x) => x.id !== item.id));
    } catch (err) {
      setNotification({ message: err.message || "Gagal menolak penerimaan barang.", type: "error" });
    }
  };

  const notifCount = isAdmin
    ? sampai.length
    : isSupplier
    ? permintaanBaru.length
    : isKaryawan
    ? responPengajuan.length
    : 0;

  // Klik salah satu notifikasi permintaan baru -> arahkan ke Kelola Pesanan
  // supplier, dan dropdown ditutup otomatis.
  const handleOpenPermintaan = () => {
    setIsNotifOpen(false);
    navigate("/dashboard/supplier/kelola-pesanan");
  };

  // Karyawan klik salah satu notifikasi respons admin -> buka pop-up detail
  // (cek detail persetujuan/penolakan) dan tandai sudah dilihat supaya
  // hilang dari badge lonceng.
  const handleOpenResponPengajuan = (item) => {
    setSelectedRespon(item);
    setIsNotifOpen(false);
    markPengajuanSeen(userKey, item.id);
    setResponPengajuan((prev) => prev.filter((x) => x.id !== item.id));
  };

  return (
    <header className="flex flex-col gap-1 mb-1 select-none">
      {selectedItem && (
        <SupplierArrivalModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
      {notification && (
        <NotificationModal notification={notification} onClose={() => setNotification(null)} />
      )}
      {selectedRespon && (
        <PengajuanNotifDetailModal item={selectedRespon} onClose={() => setSelectedRespon(null)} />
      )}

      <div className="flex flex-col xl:flex-row justify-between gap-3">
        {/* KIRI: Judul & Konteks */}
        <div className="flex-1 rounded-2xl border border-white/10 bg-[#4A151E]/90 p-4 shadow-[0_15px_40px_rgba(0,0,0,0.15)] backdrop-blur-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DAB88B]/20 text-[#F4EFE6] text-xs font-bold uppercase tracking-widest mb-3">
            <span>Gudang Berbasis Sistem</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F4EFE6] tracking-tight">{title}</h1>
        </div>

        {/* KANAN: Status, Profil & Notifikasi */}
        <div className="grid grid-cols-2 gap-3 xl:w-[40%]">
          <div className="rounded-2xl border border-white/10 bg-[#4A151E]/90 p-4 text-[#F4EFE6] shadow-sm">
            <p className="text-xs uppercase tracking-widest text-[#DAB88B]/85 flex items-center gap-1.5">
              <Wifi size={12} /> Status
            </p>
            <h2 className="mt-2 text-lg font-bold">Online</h2>
            <p className="text-xs text-[#DAB88B]/70">Gudang siap beroperasi.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#4A151E]/90 p-4 text-[#F4EFE6] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-[#DAB88B]/20 flex items-center justify-center text-[#DAB88B] font-bold text-sm">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-[11px] uppercase tracking-wide text-[#DAB88B]/80 truncate">{displayRole}</p>
              </div>
            </div>

            {/* Ikon Notifikasi */}
            <div className="relative shrink-0" ref={notifRef}>
              <button
                onClick={() => {
                  setIsNotifOpen((o) => !o);
                  if (!isNotifOpen) loadNotif();
                }}
                className="relative group cursor-pointer"
                aria-label="Notifikasi"
              >
                <Bell className="text-[#DAB88B] group-hover:text-white transition" size={18} />
                {notifCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold bg-red-500 text-white rounded-full border border-[#4A151E]">
                    {notifCount}
                  </span>
                )}
              </button>

              {/* Dropdown ringkas -> klik salah satu untuk buka pop-up detail / halaman terkait.
                  Otomatis menutup saat mengklik area lain (lihat useEffect di atas). */}
              {isNotifOpen && isAdmin && (
                <div className="absolute right-0 top-9 w-80 bg-white text-[#4A151E] rounded-xl shadow-2xl z-50 p-3 border border-[#DAB88B]/30">
                  <h4 className="text-xs font-bold uppercase text-gray-400 mb-2 tracking-wide flex items-center gap-1.5">
                    <MapPin size={13} /> Barang Sudah Sampai
                  </h4>

                  {loadingNotif ? (
                    <p className="text-xs text-gray-400 py-4 text-center flex items-center justify-center gap-1.5">
                      <Loader2 size={13} className="animate-spin" /> Memuat...
                    </p>
                  ) : sampai.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">
                      Belum ada barang yang sampai dari supplier.
                    </p>
                  ) : (
                    <div className="max-h-72 overflow-y-auto flex flex-col gap-2">
                      {sampai.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedItem(item);
                            setIsNotifOpen(false);
                          }}
                          className="w-full text-left p-2.5 bg-[#FBF8F2] rounded-lg border border-[#F4EFE6] hover:border-[#DAB88B] transition"
                        >
                          <p className="text-xs font-bold text-[#4A151E] flex items-center gap-1.5">
                            <PackageCheck size={12} className="text-[#8B2635]" />
                            {item.kode_pesanan} · {item.nama_barang}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {item.jumlah} {item.satuan} · dari {item.nama_supplier || "-"} · ETA {formatTanggal(item.eta)}
                          </p>
                          <p className="text-[10px] mt-1 font-black uppercase text-[#8B2635]">Klik untuk konfirmasi &rarr;</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {isNotifOpen && isSupplier && (
                <div className="absolute right-0 top-9 w-80 bg-white text-[#4A151E] rounded-xl shadow-2xl z-50 p-3 border border-[#DAB88B]/30">
                  <h4 className="text-xs font-bold uppercase text-gray-400 mb-2 tracking-wide flex items-center gap-1.5">
                    <PackagePlus size={13} /> Permintaan Barang Baru
                  </h4>

                  {loadingNotif ? (
                    <p className="text-xs text-gray-400 py-4 text-center flex items-center justify-center gap-1.5">
                      <Loader2 size={13} className="animate-spin" /> Memuat...
                    </p>
                  ) : permintaanBaru.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">
                      Belum ada permintaan barang baru dari admin.
                    </p>
                  ) : (
                    <div className="max-h-72 overflow-y-auto flex flex-col gap-2">
                      {permintaanBaru.map((item) => (
                        <button
                          key={item.id}
                          onClick={handleOpenPermintaan}
                          className="w-full text-left p-2.5 bg-[#FBF8F2] rounded-lg border border-[#F4EFE6] hover:border-[#DAB88B] transition"
                        >
                          <p className="text-xs font-bold text-[#4A151E] flex items-center gap-1.5">
                            <PackagePlus size={12} className="text-[#8B2635]" />
                            {item.kode_pesanan} · {item.nama_barang}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {item.jumlah} {item.satuan} · dibutuhkan {formatTanggal(item.tanggal_kebutuhan)}
                          </p>
                          <p className="text-[10px] mt-1 font-black uppercase text-[#8B2635]">Klik untuk buka Kelola Pesanan &rarr;</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {isNotifOpen && isKaryawan && (
                <div className="absolute right-0 top-9 w-80 bg-white text-[#4A151E] rounded-xl shadow-2xl z-50 p-3 border border-[#DAB88B]/30">
                  <h4 className="text-xs font-bold uppercase text-gray-400 mb-2 tracking-wide flex items-center gap-1.5">
                    <Bell size={13} /> Update Pengajuan Kamu
                  </h4>

                  {loadingNotif ? (
                    <p className="text-xs text-gray-400 py-4 text-center flex items-center justify-center gap-1.5">
                      <Loader2 size={13} className="animate-spin" /> Memuat...
                    </p>
                  ) : responPengajuan.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">
                      Belum ada pengajuan yang direspons admin.
                    </p>
                  ) : (
                    <div className="max-h-72 overflow-y-auto flex flex-col gap-2">
                      {responPengajuan.map((item) => {
                        const disetujui = item.status === "Disetujui";
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleOpenResponPengajuan(item)}
                            className="w-full text-left p-2.5 bg-[#FBF8F2] rounded-lg border border-[#F4EFE6] hover:border-[#DAB88B] transition"
                          >
                            <p className="text-xs font-bold text-[#4A151E] flex items-center gap-1.5">
                              {disetujui ? (
                                <CheckCircle2 size={12} className="text-emerald-600" />
                              ) : (
                                <MessageSquareWarning size={12} className="text-rose-600" />
                              )}
                              {item.kode_permintaan} · {item.nama_barang}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {item.jumlah} {item.satuan} ·{" "}
                              <span className={disetujui ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                                {disetujui ? "Disetujui" : "Ditolak"}
                              </span>{" "}
                              admin
                            </p>
                            <p className="text-[10px] mt-1 font-black uppercase text-[#8B2635]">Klik untuk cek detail &rarr;</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex flex-wrap items-center gap-2.5 text-xs uppercase text-gray-400 tracking-wide">
        <span className="font-bold text-[#8B2635]">Palmventory</span>
        {Array.isArray(breadcrumb) &&
          breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              <span>/</span>
              <span className={index === breadcrumb.length - 1 ? "text-[#4A151E] font-semibold" : "hover:text-[#8B2635] transition"}>
                {item}
              </span>
            </React.Fragment>
          ))}
      </nav>
    </header>
  );
}
