import "./assets/tailwind.css";
import React, { Suspense } from "react";
const AdminDashboard = React.lazy(() => import("./View/admin/AdminDashboard"));
const SupplierDashboard = React.lazy(() => import("./View/supplier/SupplierDashboard"));
const KelolaPesanan = React.lazy(() => import("./View/supplier/KelolaPesanan"));
const StatusPengiriman = React.lazy(() => import("./View/supplier/StatusPengiriman"));
const KaryawanDashboard = React.lazy(() => import("./View/karyawan/KaryawanDashboard"));
const PengajuanBarang = React.lazy(() => import("./View/karyawan/PengajuanBarang"));
const LaporanHarian = React.lazy(
  () => import("./View/admin/LaporanHarian"),
);
import MainLayout from "./layouts/MainLayout";
import { Route, Routes, Navigate } from "react-router-dom";
import NotFound from "./View/NotFound";
import Loading from "./components/Loading";
import ProtectedRoute from "./components/ProtectedRoute";
import ManajemenPengguna from "./View/admin/ManajemenPengguna";
const KelolaBarang = React.lazy(() => import("./View/admin/KelolaBarang"));

import AuthLayout from "./layouts/AuthLayout";
const Login = React.lazy(() => import("./View/auth/Login"));
const Register = React.lazy(() => import("./View/auth/Register"));
const Forgot = React.lazy(() => import("./View/auth/Forgot"));

const ROLE_ADMIN = ["Admin", "Admin/Pemilik Kebun"];
const ROLE_SUPPLIER = ["Supplier"];
const ROLE_KARYAWAN = ["Karyawan Kebun"];
import Landing from "./View/Landing";
const DataPengajuan = React.lazy(() => import("./View/admin/DataPengajuan"));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* HALAMAN UTAMA: Landing page sebelum login */}
        <Route path="/" element={<Landing />} />

        <Route element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={<Navigate to="/dashboard/admin" replace />}
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={ROLE_ADMIN}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/supplier"
            element={
              <ProtectedRoute allowedRoles={ROLE_SUPPLIER}>
                <SupplierDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/supplier/kelola-pesanan"
            element={
              <ProtectedRoute allowedRoles={ROLE_SUPPLIER}>
                <KelolaPesanan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/supplier/status-pengiriman"
            element={
              <ProtectedRoute allowedRoles={ROLE_SUPPLIER}>
                <StatusPengiriman />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/karyawan"
            element={
              <ProtectedRoute allowedRoles={ROLE_KARYAWAN}>
                <KaryawanDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/karyawan/stok"
            element={
              <ProtectedRoute allowedRoles={ROLE_KARYAWAN}>
                <PengajuanBarang />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengguna"
            element={
              <ProtectedRoute allowedRoles={ROLE_ADMIN}>
                <ManajemenPengguna />
              </ProtectedRoute>
            }
          />
          <Route
            path="/barang"
            element={
              <ProtectedRoute allowedRoles={ROLE_ADMIN}>
                <KelolaBarang />
              </ProtectedRoute>
            }
          />
          <Route
            path="/laporan"
            element={
              <ProtectedRoute allowedRoles={ROLE_ADMIN}>
                <LaporanHarian />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengajuan"
            element={
              <ProtectedRoute allowedRoles={ROLE_ADMIN}>
                <DataPengajuan />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
