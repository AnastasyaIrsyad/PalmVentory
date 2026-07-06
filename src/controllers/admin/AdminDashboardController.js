import { AdminDashboardModel } from "../../models/admin/AdminDashboardModel";

// ---- Helper tanggal (memakai zona waktu lokal browser) ----
const pad = (n) => String(n).padStart(2, "0");

// Kunci pengelompokan: YYYY-MM-DD (untuk pengurutan)
const toDateKey = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Label sumbu-X grafik: DD/MM
const labelFromKey = (key) => {
  const [, m, day] = key.split("-");
  return `${day}/${m}`;
};

// Nama bulan Indonesia
const bulanNama = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

// Helper untuk membuat data bulanan (Januari - Desember) dengan filter tahun
const generateMonthlyChartData = (pengajuan, pesanan, tahun = null) => {
  // Jika tahun tidak ditentukan, gunakan tahun saat ini
  const targetYear = tahun || new Date().getFullYear();

  // Inisialisasi 12 bulan dengan masuk & keluar = 0
  const monthlyData = bulanNama.map((nama, idx) => ({
    bulan: nama,
    bulanNum: idx + 1,
    masuk: 0,
    keluar: 0,
  }));

  // Hitung keluar dari pengajuan yang disetujui berdasarkan tgl_terima
  pengajuan.forEach((p) => {
    if ((p.status || "").toLowerCase() === "disetujui" && p.tgl_terima) {
      const d = new Date(p.tgl_terima);
      if (!isNaN(d.getTime()) && d.getFullYear() === targetYear) {
        const bulanIdx = d.getMonth();
        monthlyData[bulanIdx].keluar += parseInt(p.jumlah) || 0;
      }
    }
  });

  // Hitung masuk dari pesanan supplier yang sudah diterima (status "Selesai")
  // berdasarkan created_at. Turut mendukung nilai lama "Diterima" agar data
  // historis sebelum pembaruan alur tetap terhitung.
  pesanan.forEach((o) => {
    const s = (o.status || "").toLowerCase();
    if (s === "selesai" || s === "diterima") {
      const d = new Date(o.created_at);
      if (!isNaN(d.getTime()) && d.getFullYear() === targetYear) {
        const bulanIdx = d.getMonth();
        monthlyData[bulanIdx].masuk += parseInt(o.jumlah) || 0;
      }
    }
  });

  // Return hanya nama bulan, masuk, dan keluar (tanpa bulanNum)
  return monthlyData.map(({ bulan, masuk, keluar }) => ({
    tanggal: bulan,
    masuk,
    keluar,
  }));
};

// Helper untuk mendapatkan daftar tahun yang tersedia
const getAvailableYears = (pengajuan, pesanan) => {
  const years = new Set();

  pengajuan.forEach((p) => {
    if (p.tgl_terima) {
      const d = new Date(p.tgl_terima);
      if (!isNaN(d.getTime())) {
        years.add(d.getFullYear());
      }
    }
  });

  pesanan.forEach((o) => {
    if (o.created_at) {
      const d = new Date(o.created_at);
      if (!isNaN(d.getTime())) {
        years.add(d.getFullYear());
      }
    }
  });

  // Tambahkan tahun saat ini
  years.add(new Date().getFullYear());

  // Sort descending dan konversi ke array
  return Array.from(years).sort((a, b) => b - a);
};

export const adminDashboardController = {
  /**
   * Mengambil & menghitung seluruh data yang dibutuhkan dashboard admin.
   * Mengembalikan satu objek statistik yang siap dipakai View.
   */
  fetchDashboardData: async () => {
    const [profiles, barang, pengajuan, pesanan] = await Promise.all([
      AdminDashboardModel.getAllProfiles(),
      AdminDashboardModel.getAllBarang(),
      AdminDashboardModel.getAllPengajuan(),
      AdminDashboardModel.getAllPesananSupplier(),
    ]);

    // [Metrik 1] Total Pengguna = jumlah baris profil_pengguna
    const totalPengguna = profiles.length;

    // [Metrik 2] Stok TBS & Produk = akumulasi seluruh stok fisik di tabel barang
    const totalStok = barang.reduce(
      (acc, b) => acc + (parseInt(b.stok) || 0),
      0,
    );

    // [Metrik 3] Jumlah Ajuan Karyawan = banyaknya pengajuan dari karyawan
    const jumlahAjuan = pengajuan.length;

    // [Metrik 4] Jumlah Permintaan Barang = akumulasi unit barang yang diminta
    const jumlahPermintaanBarang = pengajuan.reduce(
      (acc, p) => acc + (parseInt(p.jumlah) || 0),
      0,
    );

    // ---- Grafik Kunjungan: komposisi peran pengguna yang masuk ke sistem ----
    const totalKaryawan = profiles.filter(
      (p) => p.role && p.role.includes("Karyawan"),
    ).length;
    const totalSupplier = profiles.filter(
      (p) => p.role && p.role.includes("Supplier"),
    ).length;
    const persenKaryawan = totalPengguna
      ? Math.round((totalKaryawan / totalPengguna) * 100)
      : 0;
    const persenSupplier = totalPengguna
      ? Math.round((totalSupplier / totalPengguna) * 100)
      : 0;

    // ---- Grafik garis: Barang Masuk & Keluar per Bulan (Jan - Des) ----
    // Kelola  = pengajuan karyawan yang berstatus "Disetujui" berdasarkan tgl_terima
    // Masuk   = pesanan supplier yang berstatus "Diterima" berdasarkan created_at
    const chartData = generateMonthlyChartData(pengajuan, pesanan);
    const availableYears = getAvailableYears(pengajuan, pesanan);

    return {
      totalPengguna,
      totalStok,
      jumlahAjuan,
      jumlahPermintaanBarang,
      totalKaryawan,
      totalSupplier,
      persenKaryawan,
      persenSupplier,
      chartData,
      availableYears,
      pengajuan,
      pesanan,
      profiles,
    };
  },

  /**
   * Catatan Sistem (pemberitahuan saat admin tidak aktif):
   * Mengembalikan akun yang dibuat SETELAH admin terakhir logout.
   * - Muncul saat admin login.
   * - Setelah admin logout lalu login lagi, akun lama tidak lagi muncul
   *   (karena patokan "admin_last_logout" sudah diperbarui ke waktu logout terakhir).
   * - Bila belum pernah logout (login pertama), patokan default = 24 jam terakhir.
   */
  getNewAccounts: (profiles) => {
    let ref = localStorage.getItem("admin_last_logout");
    if (!ref) {
      ref = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    }
    const refTime = new Date(ref).getTime();

    return (profiles || [])
      .filter(
        (p) => p.created_at && new Date(p.created_at).getTime() > refTime,
      )
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  /**
   * Mendapatkan data grafik untuk tahun tertentu
   */
  getChartDataByYear: (pengajuan, pesanan, tahun) => {
    return generateMonthlyChartData(pengajuan, pesanan, tahun);
  },
};
