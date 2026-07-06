import { Navigate } from "react-router-dom";

// Ambil data pengguna yang sedang login dari localStorage (diisi saat proses login)
const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Tentukan halaman dashboard utama sesuai role pengguna
const homeRouteForRole = (role) => {
  if (role === "Supplier") return "/dashboard/supplier";
  if (role === "Karyawan Kebun") return "/dashboard/karyawan";
  return "/dashboard/admin";
};

// Pembungkus rute: memastikan hanya pengguna yang sudah login & berperan sesuai
// yang dapat mengakses halaman tertentu. Jika belum login -> ke /login.
// Jika login tapi role tidak sesuai -> diarahkan ke dashboard milik role-nya sendiri.
export default function ProtectedRoute({ allowedRoles, children }) {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(allowedRoles) && !allowedRoles.includes(user.role)) {
    return <Navigate to={homeRouteForRole(user.role)} replace />;
  }

  return children;
}
