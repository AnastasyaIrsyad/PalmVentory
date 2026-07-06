import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { authController } from "../../controllers/auth/AuthController";

export default function Register() {
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [namaLengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Admin/Pemilik Kebun");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Kata sandi dan Konfirmasi Kata Sandi tidak cocok!");
      return;
    }
    if (password.length < 6) {
      alert("Password minimal harus 6 karakter!");
      return;
    }

    setLoading(true);

    try {
      await authController.handleRegister({
        namaLengkap,
        email,
        role,
        password,
      });

      navigate("/login", { state: { registered: true } });
    } catch (error) {
      alert(`Gagal Registrasi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* LOGO PALMVENTORY */}
      <div className="flex items-center gap-2 mb-10">
        <div className="bg-white border-2 border-[#4A151E] rounded-lg p-1.5 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-[#4A151E]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M19.428 15.428a2 2 0 01-1.022-.547l-2.387-2.387a2 2 0 00-2.828 0l-.618.619q-.13.13-.266.25l-1.374 1.374a2 2 0 01-2.828 0l-.316-.316a2 2 0 010-2.828l.316-.316a2 2 0 012.828 0l1.374 1.374q.12.12.25.266l.618.618a2 2 0 002.828 0l2.387-2.387a2 2 0 011.022-.547"
            ></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#4A151E]">PalmVentory</h1>
      </div>

      <h2 className="text-4xl font-extrabold text-[#4A151E] mb-3">
        Create account
      </h2>
      <p className="text-gray-500 mb-10">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-[#4A151E] font-semibold underline hover:text-[#3a1018]"
        >
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={namaLengkap}
            onChange={(e) => setNamaLengkap(e.target.value)}
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-1 focus:ring-[#4A151E] focus:border-[#4A151E] transition outline-none"
            placeholder="Masukkan nama lengkap Anda"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-2">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-1 focus:ring-[#4A151E] focus:border-[#4A151E] transition outline-none lowercase"
            placeholder="example@gmail.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Role / Position
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-1 focus:ring-[#4A151E] focus:border-[#4A151E] transition outline-none text-gray-700 font-medium"
          >
            <option value="Admin/Pemilik Kebun">Admin/Pemilik Kebun</option>
            <option value="Supplier">Supplier</option>
            <option value="Karyawan Kebun">Karyawan Kebun</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-1 focus:ring-[#4A151E] focus:border-[#4A151E] transition pr-12 outline-none"
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
            </button>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-1 focus:ring-[#4A151E] focus:border-[#4A151E] transition pr-12 outline-none"
              placeholder="Repeat your password"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4A151E] hover:bg-[#3a1018] text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Create now"}
        </button>
      </form>
    </div>
  );
}