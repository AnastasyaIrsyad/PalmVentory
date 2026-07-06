import React from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

// Komponen notifikasi pop-up yang dapat dipakai ulang di seluruh halaman.
// type: "success" | "error" | "warning" | "info"
export default function NotificationModal({ notification, onClose }) {
  if (!notification) return null;

  const { message, type = "success" } = notification;

  const config = {
    success: {
      title: "Berhasil",
      icon: CheckCircle2,
      iconBg: "bg-[#F4EFE6]",
      iconText: "text-[#4A151E]",
      button: "bg-[#4A151E] hover:bg-[#3a1018]",
    },
    error: {
      title: "Terjadi Kesalahan",
      icon: AlertTriangle,
      iconBg: "bg-red-50",
      iconText: "text-red-600",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      title: "Perhatian",
      icon: AlertTriangle,
      iconBg: "bg-amber-50",
      iconText: "text-amber-600",
      button: "bg-[#8B2635] hover:bg-[#6f1e2a]",
    },
    info: {
      title: "Informasi",
      icon: Info,
      iconBg: "bg-[#F4EFE6]",
      iconText: "text-[#8B2635]",
      button: "bg-[#4A151E] hover:bg-[#3a1018]",
    },
  };

  const current = config[type] || config.success;
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 bg-[#2A0D12]/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#DAB88B]/40 text-center flex flex-col items-center">
        <button
          onClick={onClose}
          className="self-end -mt-2 -mr-2 mb-2 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          aria-label="Tutup"
        >
          <X size={16} />
        </button>
        <div className={`p-3.5 rounded-full mb-4 ${current.iconBg} ${current.iconText}`}>
          <Icon size={28} strokeWidth={2.5} />
        </div>
        <h4 className="text-base font-bold text-[#4A151E] mb-1.5">
          {current.title}
        </h4>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {message}
        </p>
        <button
          onClick={onClose}
          className={`w-full py-3 rounded-xl font-semibold text-sm text-white shadow-sm transition ${current.button}`}
        >
          Oke, Mengerti
        </button>
      </div>
    </div>
  );
}
