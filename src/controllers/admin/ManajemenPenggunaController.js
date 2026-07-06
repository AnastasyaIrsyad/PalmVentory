import { ManajemenPenggunaModel } from "../../models/admin/ManajemenPenggunaModel"; // Import model dari folder admin yang baru saja dibuat

export const manajemenPenggunaController = {
  // Mengambil dan memformat data pengguna untuk dikirim ke View
  fetchUsers: async () => {
    try {
      const { data, error } = await ManajemenPenggunaModel.getAllProfiles();
      if (error) throw error;
      
      // Memetakan data agar seragam dengan properti di state React
      return data.map((user) => ({
        id: user.id,
        nama: user.nama_lengkap,
        email: user.email,
        role: user.role,
      }));
    } catch (error) {
      throw new Error(error.message || "Gagal mengambil data pengguna.");
    }
  },

  // Menangani logika hapus pengguna
  handleDeleteUser: async (id) => {
    try {
      const { error } = await ManajemenPenggunaModel.deleteProfile(id);
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(error.message || "Gagal menghapus pengguna.");
    }
  }
};