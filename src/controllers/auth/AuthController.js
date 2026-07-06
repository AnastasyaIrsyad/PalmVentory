import { supabase } from "../../SupabaseClient";
import { AuthModel } from "../../models/auth/AuthModel";

export const authController = {
  handleRegister: async ({ namaLengkap, email, role, password }) => {
  const { data, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) throw authError;

  if (data.user) {
    // Simpan password plain text ke tabel, bukan hash
    const { error: profileError } = await AuthModel.createProfile(
      data.user.id,
      namaLengkap,
      email,
      role,
      password // <-- GANTI INI, sebelumnya pakai hashPasswordDosen
    );
    if (profileError) throw profileError;

    await supabase.auth.signOut();
  }
  return data;
},

  handleLogin: async ({ email, password }) => {
    // 1. Ambil data profil dari tabel berdasarkan email
    const { data: profile, error: profileError } = await AuthModel.checkPasswordMatch(email);

    // LOGIKA 1: Jika email tidak ditemukan di database (Akun belum terdaftar)
    if (profileError || !profile) {
      throw new Error("Akun belum terdaftar! Silakan periksa kembali email Anda.");
    }

    // 2. Cocokkan password input vs password di tabel
    // LOGIKA 2: Karena profile ketemu tapi password tidak cocok (Password salah)
    if (profile.password_terinkripsi !== password) {
      throw new Error("Inputan password salah!");
    }

    // 3. Simpan ke localStorage jika semuanya benar, bypass Supabase Auth session
    const userData = {
      id: profile.id,
      email: profile.email,
      nama_lengkap: profile.nama_lengkap,
      role: profile.role,
    };

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("role", profile.role);

    return {
      user: userData,
      session: null,
      role: profile.role,
    };
},

  verifyEmailForReset: async (email) => {
    const { data, error } = await AuthModel.checkEmailExists(email);
    if (error) throw error;
    if (!data) throw new Error("Email tidak terdaftar di sistem Palmventory!");
    return data;
  },

  handleUpdatePassword: async (email, newPassword) => {
    // Simpan password plain text langsung ke tabel
    const { error: tableError } = await AuthModel.updateProfilePassword(email, newPassword);
    if (tableError) throw tableError;

    await supabase.auth.signOut();
    localStorage.clear();
  },
};