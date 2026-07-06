import { supabase } from "../../SupabaseClient";

export const AuthModel = {
  createProfile: async (id, namaLengkap, email, role, hashPassword) => {
    const { error } = await supabase
      .from("profil_pengguna")
      .insert([{
        id: id,
        nama_lengkap: namaLengkap,
        email: email,
        role: role,
        password_terinkripsi: hashPassword,
      }]);
    return { error };
  },

  checkEmailExists: async (email) => {
    const { data, error } = await supabase
      .from("profil_pengguna")
      .select("email")
      .eq("email", email)
      .maybeSingle();
    return { data, error };
  },

  updateProfilePassword: async (email, newPassword) => {
    const { error } = await supabase
      .from("profil_pengguna")
      .update({ password_terinkripsi: newPassword })
      .eq("email", email);
    return { error };
  },

  // TAMBAHAN BARU
  checkPasswordMatch: async (email) => {
    const { data, error } = await supabase
      .from("profil_pengguna")
      .select("id, nama_lengkap, email, role, password_terinkripsi")
      .eq("email", email)
      .single();
    return { data, error };
  },
};