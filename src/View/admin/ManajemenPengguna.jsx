import React, { useState, useEffect } from "react";
// SESUAIKAN IMPORT KE SUB-FOLDER ADMIN YANG BARU (mundur 1 tingkat karena file ada di src/pages)
import { manajemenPenggunaController } from "../../controllers/admin/ManajemenPenggunaController";
import NotificationModal from "../../components/NotificationModal";
import {
  Users,
  Truck,
  Trash2,
  Eye,
  UserCog,
  X,
  ChevronRight,
  ShieldCheck, // Icon tambahan untuk Admin
  AlertTriangle,
} from "lucide-react";

export default function ManajemenPengguna() {
  // 1. Inisialisasi state kosong [], data dummy dipindahkan ke backend/Supabase
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  // 2. Ambil data asli dari database secara otomatis saat halaman dirender
  useEffect(() => {
    loadDataPengguna();
  }, []);

  const loadDataPengguna = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await manajemenPenggunaController.fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal mengambil data dari database.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Modifikasi fungsi hapus agar sinkron dengan database lewat controller
  //    Konfirmasi hapus sekarang berupa pop-up kustom (bukan window.confirm bawaan browser)
  const removeUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await manajemenPenggunaController.handleDeleteUser(userToDelete.id);
      // Jika sukses di DB, perbarui state tampilan lokal
      setUsers((prev) => prev.filter((user) => user.id !== userToDelete.id));
      setUserToDelete(null);
      setNotification({ message: "Pengguna sukses dihapus!", type: "success" });
    } catch (err) {
      setUserToDelete(null);
      setNotification({ message: err.message || "Gagal menghapus pengguna.", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  // MENGGUNAKAN .includes() AGAR COCOK DENGAN STRING PANJANG DI SUPABASE
  const stats = [
    {
      label: "Akun Karyawan",
      count: users.filter((u) => u.role && u.role.includes("Karyawan")).length,
      icon: <Users size={24} />,
      bg: "bg-[#F4EFE6]",
      text: "text-[#4A151E]",
    },
    {
      label: "Akun Supplier",
      count: users.filter((u) => u.role && u.role.includes("Supplier")).length,
      icon: <Truck size={24} />,
      bg: "bg-[#F4EFE6]",
      text: "text-[#8B2635]",
    },
    {
      label: "Total Pengguna",
      count: users.length,
      icon: <UserCog size={24} />,
      bg: "bg-[#F4EFE6]",
      text: "text-[#DAB88B]",
    },
  ];

  // Tampilan loading statis yang rapi saat mengambil data dari Supabase
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FDFBF7] rounded-4xl p-6">
        <div className="text-center">
          <p className="text-[#4A151E] font-black tracking-widest animate-pulse text-lg">
            MENYINKRONKAN DATA DB SUPABASE...
          </p>
        </div>
      </div>
    );
  }

  return (
    // Wrapper utama dengan rounded-4xl agar sudut luar sangat tumpul
    <div className="w-full h-full overflow-y-auto flex flex-col gap-6 p-6 bg-[#FDFBF7] rounded-4xl">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="bg-white p-6 rounded-3xl border border-[#DAB88B]/30 shadow-sm w-full md:w-auto">
          <nav className="flex items-center gap-2 text-xs font-black text-[#8B2635] uppercase tracking-wide mb-2">
            <span>Palmventory</span> <ChevronRight size={10} />{" "}
            <span>Manajemen Pengguna</span>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-black text-[#4A151E] tracking-tighter">
            Manajemen Pengguna
          </h1>
        </div>
        <div className="bg-[#4A151E] text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-wide shadow-lg">
          {users.length} PENGGUNA AKTIF
        </div>
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 text-sm font-bold text-red-700 rounded-2xl">
          {error}
        </div>
      )}

      {/* STATISTIK SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl p-6 shadow-sm border border-[#DAB88B]/20 flex justify-between items-center"
          >
            <div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest">
                {stat.label}
              </p>
              <h2 className="text-3xl font-black text-[#4A151E]">
                {stat.count}
              </h2>
            </div>
            <div
              className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.text}`}
            >
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* DAFTAR PENGGUNA SECTION - SEKARANG JADI 3 KOLOM AGAR ADMIN BISA TAMPIL */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <UserGroup
          title="Karyawan"
          icon={<Users size={20} />}
          color="maroon"
          data={users.filter((u) => u.role && u.role.includes("Karyawan"))}
          onRemove={setUserToDelete}
          onDetail={setSelectedUser}
        />
        <UserGroup
          title="Supplier"
          icon={<Truck size={20} />}
          color="beige"
          data={users.filter((u) => u.role && u.role.includes("Supplier"))}
          onRemove={setUserToDelete}
          onDetail={setSelectedUser}
        />
        <UserGroup
          title="Admin / Pemilik"
          icon={<ShieldCheck size={20} />}
          color="maroon"
          data={users.filter((u) => u.role && u.role.includes("Admin"))}
          onRemove={setUserToDelete}
          onDetail={setSelectedUser}
        />
      </div>

      {/* MODAL DETAIL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-[#4A151E]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-[#DAB88B]/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg text-[#4A151E] uppercase tracking-tighter">
                Detail Akun
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Nama Lengkap
                </p>
                {/* MENGGUNAKAN nama_lengkap SESUAI DATA SUPABASE */}
                <p className="font-bold text-[#4A151E]">
                  {selectedUser.nama_lengkap || selectedUser.nama}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Email Terdaftar
                </p>
                <p className="font-bold text-[#4A151E]">{selectedUser.email}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Role Sistem
                </p>
                <p className="font-bold text-[#4A151E]">{selectedUser.role}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="w-full mt-6 bg-[#4A151E] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#8B2635] transition"
            >
              TUTUP
            </button>
          </div>
        </div>
      )}

      {/* POP-UP KONFIRMASI HAPUS PENGGUNA (menggantikan window.confirm bawaan browser) */}
      {userToDelete && (
        <div className="fixed inset-0 bg-[#2A0D12]/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#DAB88B]/40 text-center flex flex-col items-center">
            <div className="p-3.5 rounded-full mb-4 bg-red-50 text-red-600">
              <AlertTriangle size={28} strokeWidth={2.5} />
            </div>
            <h4 className="text-base font-bold text-[#4A151E] mb-1.5">
              Hapus Pengguna Ini?
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Anda akan menghapus akun{" "}
              <span className="font-bold text-[#4A151E]">
                {userToDelete.nama_lengkap || userToDelete.nama}
              </span>
              . Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setUserToDelete(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition disabled:opacity-60"
              >
                Batal
              </button>
              <button
                onClick={removeUser}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl font-semibold text-sm text-white bg-red-600 hover:bg-red-700 shadow-sm transition disabled:opacity-60"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFIKASI HASIL HAPUS (berhasil / gagal) - pop-up, bukan alert() */}
      {notification && (
        <NotificationModal
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

// Komponen Pembantu UserGroup
function UserGroup({ title, icon, color, data, onRemove, onDetail }) {
  const isMaroon = color === "maroon";
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#DAB88B]/20 flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isMaroon ? "bg-[#4A151E] text-white" : "bg-[#DAB88B] text-white"}`}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-black text-[#4A151E] uppercase tracking-tighter">
            {title}
          </h2>
        </div>
      </div>
      <div className="flex-1 space-y-3">
        {data.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            Tidak ada pengguna dengan peran {title.toLowerCase()} ditemukan.
          </p>
        ) : (
          data.map((user) => {
            // Memastikan data nama diambil dari properti nama_lengkap milik database Supabase kamu
            const namaTampil = user.nama_lengkap || user.nama || "No Name";
            return (
              <div
                key={user.id}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex justify-between items-center hover:border-[#DAB88B]/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#4A151E] text-white flex items-center justify-center font-black text-xs">
                    {namaTampil.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-[#4A151E]">
                      {namaTampil}
                    </h3>
                    <span className="text-xs font-bold uppercase text-[#8B2635] bg-[#F4EFE6] px-2 py-0.5 rounded-md">
                      {user.role}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onDetail(user)}
                    className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-[#4A151E]"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onRemove(user)}
                    className="p-2 rounded-lg bg-white border border-red-100 text-red-400 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
