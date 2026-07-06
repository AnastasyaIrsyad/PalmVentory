import { supabase } from "../../SupabaseClient"; // Naiknya dua tingkat karena sekarang ada di dalam sub-folder admin

export const ManajemenPenggunaModel = {
  // Ambil seluruh data profil dari tabel profil_pengguna
  getAllProfiles: async () => {
    const { data, error } = await supabase
      .from("profil_pengguna")
      .select("id, nama_lengkap, email, role")
      .order("nama_lengkap", { ascending: true });
    return { data, error };
  },

  // Hapus pengguna dari tabel berdasarkan ID
  deleteProfile: async (id) => {
    const { error } = await supabase
      .from("profil_pengguna")
      .delete()
      .eq("id", id);
    return { error };
  }
};