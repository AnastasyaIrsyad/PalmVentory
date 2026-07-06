import { supabase } from "../../SupabaseClient";

export const LaporanHarianModel = {
  getAllLaporan: async () => {
    const { data, error } = await supabase
      .from("laporan")
      .select(`
        id_laporan,
        id_sku,
        barang_masuk,
        barang_keluar,
        stok_akhir,
        created_at,
        barang (
          nama_barang,
          kategori,
          stok
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  },

  // =========================
  // SIMPAN LAPORAN BARANG KELUAR (setiap pengurangan stok = 1 baris baru)
  // stokAkhir = sisa stok TEPAT SETELAH transaksi ini (snapshot historis),
  // supaya baris laporan lama tidak ikut berubah saat ada transaksi baru.
  // sumberTabel menandai ASAL transaksi (pengajuan_karyawan, kelola_barang, dst)
  // supaya jejak setiap perubahan stok — dari manapun asalnya — selalu tercatat.
  // =========================
  insertLaporanKeluar: async (namaBarang, jumlahKeluar, sumberReferensi = null, stokAkhir = null, sumberTabel = "pengajuan_karyawan") => {
    const { data: barang, error } = await supabase
      .from("barang")
      .select("id_sku")
      .eq("nama_barang", namaBarang)
      .single();

    if (error) throw error;

    const { error: insertError } = await supabase.from("laporan").insert([
      {
        id_sku: barang.id_sku,
        barang_masuk: 0,
        barang_keluar: jumlahKeluar,
        stok_akhir: stokAkhir,
        sumber_referensi: sumberReferensi ? String(sumberReferensi) : null,
        sumber_tabel: sumberTabel,
      },
    ]);

    if (insertError) throw insertError;
  },

  // =========================
  // SIMPAN LAPORAN BARANG MASUK (setiap penambahan stok = 1 baris baru)
  // stokAkhir = sisa stok TEPAT SETELAH transaksi ini (snapshot historis).
  // =========================
  insertLaporanMasuk: async (idSku, jumlahMasuk, sumberReferensi = null, stokAkhir = null, sumberTabel = "pesanan_supplier") => {
    const { error } = await supabase.from("laporan").insert([
      {
        id_sku: idSku,
        barang_masuk: jumlahMasuk,
        barang_keluar: 0,
        stok_akhir: stokAkhir,
        sumber_referensi: sumberReferensi ? String(sumberReferensi) : null,
        sumber_tabel: sumberTabel,
      },
    ]);

    if (error) throw error;
  },
};