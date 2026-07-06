import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";

// Banner ringan yang tampil otomatis di ATAS konten dashboard setelah login
// berhasil (menggantikan alert() browser yang perlu diklik "OK"). Gaya visual
// disamakan dengan banner sukses lain di sistem (mis. "Berhasil mengirim
// pengajuan..." di menu Pengajuan Barang) — banner inline hijau di atas
// konten halaman, bukan kartu melayang di pojok layar.
// Banner ini HANYA menempel di halaman Dashboard tempat ia pertama kali
// muncul setelah login — begitu pengguna pindah ke menu lain, banner ini
// otomatis hilang (tidak ikut terbawa ke halaman lain).
export default function LoginSuccessToast() {
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [namaLengkap, setNamaLengkap] = useState("");
  const [dashboardPath, setDashboardPath] = useState(null);

  useEffect(() => {
    if (location.state?.justLoggedIn) {
      setNamaLengkap(location.state?.namaLengkap || "");
      setDashboardPath(location.pathname);
      setVisible(true);

      // Bersihkan state riwayat navigasi agar toast tidak muncul lagi
      // saat halaman di-refresh atau tombol back ditekan.
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Begitu pengguna pindah ke menu/halaman lain (pathname berubah dari
  // halaman Dashboard tempat banner ini pertama tampil), sembunyikan.
  useEffect(() => {
    if (visible && dashboardPath && location.pathname !== dashboardPath) {
      setVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleClose = () => setVisible(false);

  if (!visible) return null;

  return (
    <div className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200">
      <CheckCircle2 size={20} strokeWidth={2.5} className="shrink-0 mt-0.5" />
      <p className="flex-1">
        {namaLengkap ? `Berhasil login! Selamat datang kembali, ${namaLengkap}.` : "Berhasil login! Selamat datang di Palmventory."}
      </p>
      <button
        type="button"
        onClick={handleClose}
        aria-label="Tutup notifikasi"
        className="shrink-0 p-1 rounded-full text-emerald-600/70 hover:text-emerald-800 hover:bg-emerald-100 transition"
      >
        <X size={14} strokeWidth={3} />
      </button>
    </div>
  );
}
