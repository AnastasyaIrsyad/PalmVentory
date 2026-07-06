import { supabase } from "../../SupabaseClient";
import { PESANAN_STATUS } from "../../utils/pesananStatus";

export const DataPengajuanModel = {
  // === DATA ADMIN: PENGAJUAN KARYAWAN ===
  getAllKaryawan: async () => {
    const { data, error } = await supabase
      .from("pengajuan_karyawan")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // 1. Update status pengajuan karyawan
  // tgl_terima diisi otomatis dengan tanggal hari ini setiap kali admin
  // memutuskan (setuju/tolak), supaya kolom "Tgl Balasan" / "Tanggal Balasan"
  // di UI tidak lagi macet menampilkan "Pending" selamanya, dan grafik
  // bulanan (baik di dashboard admin maupun karyawan) bisa mengelompokkan
  // transaksi berdasarkan tanggal keputusan yang sebenarnya.
  updateStatusKaryawan: async (id, status, alasanPenolakan = null) => {
    const hariIni = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("pengajuan_karyawan")
      .update({
        status: status,
        alasan_penolakan: alasanPenolakan,
        tgl_terima: hariIni,
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data;
  },

  // 2. Mengurangi stok barang di tabel 'barang' saat pengajuan karyawan di-ACC
  // Mengembalikan stok TERBARU (setelah dikurangi) agar bisa dicatat sebagai
  // snapshot "stok_akhir" pada baris laporan yang bersangkutan.
  kurangiStokBarang: async (namaBarang, jumlahDiambil) => {
    const { data: barang, error: fetchError } = await supabase
      .from("barang")
      .select("id_sku, stok")
      .eq("nama_barang", namaBarang)
      .single();

    if (fetchError || !barang) {
      throw new Error(`Barang '${namaBarang}' tidak ditemukan di tabel gudang.`);
    }

    const stokSekarang = parseInt(barang.stok);
    const stokBaru = stokSekarang - parseInt(jumlahDiambil);

    if (stokBaru < 0) {
      throw new Error(`Stok gudang tidak mencukupi! Sisa stok saat ini hanya ${stokSekarang}.`);
    }

    const { error: updateError } = await supabase
      .from("barang")
      .update({ stok: stokBaru })
      .eq("id_sku", barang.id_sku);

    if (updateError) throw updateError;
    return stokBaru;
  },

  // === DATA ADMIN: PESANAN KE SUPPLIER ===
  getAllSupplier: async () => {
    const { data, error } = await supabase
      .from("pesanan_supplier")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Membuat Kode Pesanan otomatis berformat PO-0001, PO-0002, dst.
  // Dihitung dari nomor urut TERBESAR yang pernah dipakai (bukan dari
  // jumlah baris), supaya tetap unik walau ada pesanan yang sudah dihapus.
  generateKodePesanan: async () => {
    const { data, error } = await supabase
      .from("pesanan_supplier")
      .select("kode_pesanan");
    if (error) throw error;

    const maxNum = (data || []).reduce((max, row) => {
      const match = /^PO-(\d+)$/i.exec(row?.kode_pesanan || "");
      if (!match) return max;
      const num = parseInt(match[1], 10);
      return Number.isFinite(num) && num > max ? num : max;
    }, 0);

    return `PO-${String(maxNum + 1).padStart(4, "0")}`;
  },

  createSupplierOrder: async (orderData) => {
    // ID/Kode Pesanan SELALU dibuat otomatis oleh sistem, admin tidak
    // pernah menginputnya secara manual.
    const kodePesanan = await DataPengajuanModel.generateKodePesanan();
    const payload = { ...orderData, kode_pesanan: kodePesanan, status: PESANAN_STATUS.MENUNGGU };
    const { data, error } = await supabase.from("pesanan_supplier").insert([payload]).select();
    if (error) throw error;
    return data;
  },

  // Admin membatalkan permintaan miliknya sendiri (hanya valid sebelum supplier merespon)
  cancelSupplierOrder: async (id) => {
    const { data, error } = await supabase
      .from("pesanan_supplier")
      .update({ status: PESANAN_STATUS.DIBATALKAN })
      .eq("id", id)
      .eq("status", PESANAN_STATUS.MENUNGGU)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error("Pesanan tidak dapat dibatalkan (sudah diproses supplier).");
    }
    return data;
  },

  // Ambil pesanan supplier yang berstatus "Sampai" (untuk notifikasi Admin)
  getPesananSampai: async () => {
    const { data, error } = await supabase
      .from("pesanan_supplier")
      .select("*")
      .eq("status", PESANAN_STATUS.SAMPAI)
      .order("eta", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // ADMIN menerima barang fisik: status -> "Selesai" & stok gudang bertambah (+)
  confirmSupplierReceived: async (pesanan) => {
    const namaBarang = pesanan.nama_barang;
    const jumlahMasuk = parseInt(pesanan.jumlah) || 0;

    const { data: barangAda, error: cariError } = await supabase
      .from("barang")
      .select("id_sku, stok")
      .eq("nama_barang", namaBarang)
      .maybeSingle();

    if (cariError) throw cariError;

    let idSku;
    let stokAkhir;

    if (barangAda) {
      stokAkhir = (parseInt(barangAda.stok) || 0) + jumlahMasuk;

      await supabase.from("barang").update({ stok: stokAkhir }).eq("id_sku", barangAda.id_sku);

      idSku = barangAda.id_sku;
    } else {
      const { count } = await supabase.from("barang").select("*", { count: "exact", head: true });

      idSku = `BRG${String((count || 0) + 1).padStart(2, "0")}`;
      stokAkhir = jumlahMasuk;

      await supabase.from("barang").insert([
        {
          id_sku: idSku,
          nama_barang: namaBarang,
          kategori: "Umum",
          stok: jumlahMasuk,
          lokasi_penyimpanan: "Belum ditentukan",
          keterangan: `Masuk dari supplier ${pesanan.nama_supplier}`,
        },
      ]);
    }

    const { data, error } = await supabase
      .from("pesanan_supplier")
      .update({ status: PESANAN_STATUS.SELESAI })
      .eq("id", pesanan.id)
      .select();

    if (error) throw error;

    return { data, idSku, jumlahMasuk, stokAkhir };
  },

  // ADMIN tidak menerima barang fisik (rusak/tidak sesuai): stok TIDAK bertambah
  rejectSupplierDelivery: async (pesanan, alasan = null) => {
    const { data, error } = await supabase
      .from("pesanan_supplier")
      .update({
        status: PESANAN_STATUS.DITOLAK_ADMIN,
        alasan_penolakan: alasan && alasan.trim() ? alasan.trim() : "Ditolak oleh admin saat penerimaan barang.",
      })
      .eq("id", pesanan.id)
      .select();

    if (error) throw error;
    return data;
  },

  // Ambil daftar pengiriman supplier yang BERHASIL (Selesai) — dipakai sebagai
  // sumber opsi dropdown Nama Barang & Jumlah Stok di halaman Kelola Barang.
  // Batch yang sudah pernah dipilih & dimasukkan ke Kelola Barang (sudah_ditambahkan
  // = true) TIDAK ditampilkan lagi di dropdown, supaya stok yang sama tidak
  // bisa ditambahkan dua kali oleh admin.
  getSuccessfulDeliveries: async () => {
    const { data, error } = await supabase
      .from("pesanan_supplier")
      .select("id, kode_pesanan, nama_barang, jumlah, satuan, nama_supplier, diperbarui_pada, sudah_ditambahkan")
      .eq("status", PESANAN_STATUS.SELESAI)
      .or("sudah_ditambahkan.is.null,sudah_ditambahkan.eq.false")
      .order("diperbarui_pada", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Tandai satu batch pengiriman sebagai "sudah dimasukkan" ke Kelola Barang,
  // supaya menghilang dari dropdown pilihan pada form berikutnya.
  markDeliveryUsed: async (id) => {
    if (!id) return;
    const { error } = await supabase
      .from("pesanan_supplier")
      .update({ sudah_ditambahkan: true })
      .eq("id", id);
    if (error) throw error;
  },
};
