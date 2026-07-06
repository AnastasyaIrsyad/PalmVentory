import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft as IconLeft,
  FiEye as IconEye,
  FiEyeOff as IconEyeOff,
} from "react-icons/fi";
import { BsFillExclamationDiamondFill } from "react-icons/bs";
import { ImSpinner2 } from "react-icons/im";
import { authController } from "../../controllers/auth/AuthController";

export default function Forgot() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authController.verifyEmailForReset(email);
      setShowModal(true);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat memeriksa email.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      alert("Kata sandi baru dan Konfirmasi tidak cocok!");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password minimal harus 6 karakter!");
      return;
    }

    setModalLoading(true);

    try {
      await authController.handleUpdatePassword(email, newPassword);
      setShowModal(false);
      navigate("/login", { state: { passwordReset: true } });
    } catch (err) {
      alert(`Gagal mengubah password: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="relative">
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
        Forgot password
      </h2>
      <p className="text-gray-500 mb-10">
        Enter your email address to check registration and reset your password.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 mb-6 p-4 text-sm font-medium text-red-700 rounded-lg flex items-start">
          <BsFillExclamationDiamondFill className="text-red-600 me-3 text-lg mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleCheckEmail}>
        <div className="mb-8">
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
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4A151E] hover:bg-[#3a1018] text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg mb-6 flex items-center justify-center gap-2 disabled:bg-gray-400"
        >
          {loading ? (
            <>
              <ImSpinner2 className="animate-spin text-lg" /> Memeriksa...
            </>
          ) : (
            "Verify Email"
          )}
        </button>
      </form>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A151E] hover:text-[#3a1018] transition-colors"
        >
          <IconLeft /> Back to Sign in
        </Link>
      </div>

      {/* MODAL NEW PASSWORD */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-gray-950 mb-2">
              Create New Password
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Email terverifikasi! Silakan masukkan kata sandi baru untuk akun{" "}
              <span className="font-semibold text-gray-800">{email}</span>.
            </p>

            <form onSubmit={handleUpdatePassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#4A151E] focus:border-[#4A151E] outline-none transition pr-12"
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#4A151E] focus:border-[#4A151E] outline-none transition pr-12"
                    placeholder="Repeat your new password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                  disabled={modalLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#4A151E] hover:bg-[#3a1018] text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:bg-gray-400"
                  disabled={modalLoading}
                >
                  {modalLoading ? (
                    <>
                      <ImSpinner2 className="animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    "Save & Login"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}