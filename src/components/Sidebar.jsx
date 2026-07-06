import React from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  LogOut,
  Truck,
  ClipboardList,
  Leaf,
  ChevronRight,
} from "lucide-react";

const menuDefinitions = {
  admin: [
    {
      type: "link",
      to: "/dashboard/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    { type: "link", to: "/pengguna", label: "Manajemen Pengguna", icon: Users },
    { type: "link", to: "/barang", label: "Kelola Barang", icon: Package },
    { type: "link", to: "/pengajuan", label: "Data Pengajuan", icon: ClipboardList },
    { type: "link", to: "/laporan", label: "Laporan Harian", icon: FileText },
  ],
  supplier: [
    {
      type: "link",
      to: "/dashboard/supplier",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      type: "link",
      to: "/dashboard/supplier/kelola-pesanan",
      label: "Kelola Pesanan",
      icon: Package,
    },
    {
      type: "link",
      to: "/dashboard/supplier/status-pengiriman",
      label: "Status Pengiriman",
      icon: Truck,
    },
  ],
  karyawan: [
    {
      type: "link",
      to: "/dashboard/karyawan",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    { type: "link", to: "/dashboard/karyawan/stok", label: "Pengajuan Barang", icon: Package },
  ],
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const role = location.pathname.includes("/dashboard/supplier")
    ? "supplier"
    : location.pathname.includes("/dashboard/karyawan")
      ? "karyawan"
      : "admin";

  const menuClass = ({ isActive }) =>
    `w-full flex cursor-pointer items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group font-semibold text-sm ${isActive ? "bg-[#DAB88B] text-[#3A1019] shadow-lg" : "text-[#F4EFE6]/80 hover:bg-white/10 hover:text-white"}`;

  const buttonClass =
    "w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group font-semibold text-sm text-[#F4EFE6]/85 hover:bg-white/10 hover:text-white";

  const handleLogout = async () => {
    try {
      // Catat waktu admin keluar sistem -> dipakai dashboard untuk
      // pemberitahuan "Catatan Sistem" (akun baru saat admin tidak aktif).
      if (role === "admin") {
        localStorage.setItem("admin_last_logout", new Date().toISOString());
      }
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    } catch {
      // abaikan jika localStorage tidak tersedia
    }
    try {
      const { supabase } = await import("../SupabaseClient");
      await supabase.auth.signOut();
    } catch {
      // abaikan jika tidak ada sesi auth aktif
    }
    navigate("/login");
  };

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const homeRoute =
    role === "supplier"
      ? "/dashboard/supplier"
      : role === "karyawan"
        ? "/dashboard/karyawan"
        : "/dashboard/admin";

  return (
    <aside className="w-72 h-screen bg-[#3A1019] border-r border-[#5A2230] flex flex-col fixed top-0 left-0 font-sans antialiased z-50 shadow-2xl overflow-y-auto">
      <div className="p-5">
        <Link to={homeRoute} className="flex items-center gap-3 group">
          <div className="relative">
            <div className="bg-[#DAB88B] p-3 rounded-2xl shadow-[0_20px_50px_rgba(218,184,139,0.25)] transition-transform group-hover:-translate-y-1">
              <Leaf className="text-[#3A1019]" size={22} fill="currentColor" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F4EFE6] tracking-tight">
              Palm<span className="text-[#DAB88B]">ventory</span>
            </h1>
            <p className="text-[11px] uppercase tracking-widest text-[#DAB88B]/75 mt-0.5">
              Gudang Kelapa Sawit
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-1 px-4 overflow-y-auto pb-6">
        <p className="text-xs font-bold text-[#DAB88B]/55 ml-3 mb-3 uppercase tracking-wider">
          Menu{" "}
          {role === "supplier"
            ? "Supplier"
            : role === "karyawan"
              ? "Karyawan"
              : "Admin"}
        </p>
        <ul className="space-y-2">
          {menuDefinitions[role].map((item) => (
            <li key={item.label}>
              {item.type === "link" ? (
                /* DI SINI PERBAIKANNYA: Menambahkan atribut end agar deteksi link bersifat mutlak */
                <NavLink to={item.to} className={menuClass} end>
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3.5">
                        <item.icon
                          size={18}
                          strokeWidth={2.25}
                          className={`${isActive ? "text-[#3A1019]" : "group-hover:text-[#DAB88B]"} transition-colors`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {isActive && (
                        <ChevronRight
                          size={15}
                          strokeWidth={3}
                          className="text-[#3A1019]/55"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ) : (
                <button
                  onClick={() => handleScroll(item.target)}
                  className={buttonClass}
                >
                  <div className="flex items-center gap-3.5">
                    <item.icon
                      size={18}
                      strokeWidth={2.25}
                      className="text-[#F4EFE6]/80 group-hover:text-[#DAB88B] transition-colors"
                    />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight
                    size={15}
                    strokeWidth={3}
                    className="text-[#DAB88B]/65"
                  />
                </button>
              )}
            </li>
          ))}
        </ul>

        <div className="pt-7 space-y-2">
          <p className="text-xs font-bold text-[#DAB88B]/50 ml-3 mb-3 uppercase tracking-wider">
            Akun
          </p>
          <ul className="space-y-2">
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[#F4D9B0] hover:bg-white/10 transition-all font-semibold text-sm"
              >
                <LogOut size={18} strokeWidth={2.25} />
                <span>Keluar</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}