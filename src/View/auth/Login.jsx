import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { BsFillExclamationDiamondFill, BsFillCheckCircleFill } from "react-icons/bs";
import { ImSpinner2 } from "react-icons/im";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { authController } from "../../controllers/auth/AuthController";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [dataForm, setDataForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  useEffect(() => {
    if (location.state?.registered) {
      setSuccess("Register berhasil! Silakan masuk menggunakan akun baru Anda.");
      window.history.replaceState({}, document.title);
    } else if (location.state?.passwordReset) {
      setSuccess("Password berhasil diubah! Silakan masuk kembali.");
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    const finalValue = type === "checkbox" ? checked : name === "email" ? value.toLowerCase() : value;
    setDataForm({ ...dataForm, [name]: finalValue });
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await authController.handleLogin({
        email: dataForm.email,
        password: dataForm.password,
      });

      const role = result.role;
      let target = "/";
      if (role === "Admin" || role === "Admin/Pemilik Kebun") {
        target = "/dashboard/admin";
      } else if (role === "Supplier") {
        target = "/dashboard/supplier";
      } else if (role === "Karyawan Kebun") {
        target = "/dashboard/karyawan";
      }

      navigate(target, {
        state: { justLoggedIn: true, namaLengkap: result.user?.nama_lengkap || "" },
      });
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat masuk akun.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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

      <h2 className="text-4xl font-extrabold text-[#4A151E] mb-3">Sign in</h2>
      <p className="text-gray-500 mb-10">
        Don’t have an account?{" "}
        <Link
          to="/register"
          className="text-[#4A151E] font-semibold underline hover:text-[#3a1018]"
        >
          Create now
        </Link>
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 mb-6 p-4 text-sm font-medium text-red-700 rounded-lg flex items-start">
          <BsFillExclamationDiamondFill className="text-red-600 me-3 text-lg mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {!error && success && (
        <div className="bg-emerald-50 border border-emerald-200 mb-6 p-4 text-sm font-medium text-emerald-700 rounded-lg flex items-start">
          <BsFillCheckCircleFill className="text-emerald-600 me-3 text-lg mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {loading && (
        <div className="bg-gray-100 mb-6 p-4 text-sm text-gray-700 rounded-lg flex items-center">
          <ImSpinner2 className="me-3 animate-spin text-lg text-gray-500" /> Mohon Tunggu...
        </div>
      )}

      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-2">
            E-mail
          </label>
          <input
            type="email"
            name="email"
            value={dataForm.email}
            onChange={handleChange}
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-1 focus:ring-[#4A151E] focus:border-[#4A151E] transition outline-none lowercase"
            placeholder="example@gmail.com"
            autoComplete="username"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={dataForm.password}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-1 focus:ring-[#4A151E] focus:border-[#4A151E] transition pr-12 outline-none"
              placeholder="@#*%"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              {/* Logika yang sudah diperbaiki */}
              {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={dataForm.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-[#4A151E] focus:ring-[#4A151E] border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2.5 block text-sm text-gray-500">
              Remember me
            </label>
          </div>
          <Link
            to="/forgot"
            className="text-sm font-semibold text-[#4A151E] underline hover:text-[#3a1018]"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4A151E] hover:bg-[#3a1018] text-white font-bold py-4 px-6 rounded-xl transition-colors disabled:bg-gray-400 shadow-lg"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}