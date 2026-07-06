// src/layouts/authlayout.jsx
import { Outlet } from "react-router-dom";
import { FiLifeBuoy } from "react-icons/fi";

export default function AuthLayout() {
  return (
    // Background utama menggunakan abu-abu muda agar "Card" putih terlihat menonjol
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F4EFE6] p-4 md:p-10 font-sans">
      {/* KONTENER UTAMA (CARD) */}
      <div className="bg-white w-full max-w-6xl min-h-175 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* SISI KIRI - AREA FORMULIR */}
        <div className="w-full md:w-1/2 flex flex-col p-8 md:p-16 lg:p-20 bg-white">
          <div className="flex-1 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto">
              <Outlet />
            </div>
          </div>

          {/* Footer di dalam kartu */}
          <p className="text-center text-xs text-gray-400 mt-8">
            © 2026 Sistem Manajemen Stok & Distribusi Operasional Perkebunan
            Kelapa Sawit.
          </p>
        </div>

        {/* SISI KANAN - AREA INFO (Burgundy Solid) */}
        <div className="w-full md:w-1/2 bg-[#4A151E] text-white flex flex-col p-8 md:p-12 relative overflow-hidden">
          {/* Efek Cahaya Dekoratif di Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

          {/* Tombol Support */}
          <div className="relative z-10 flex justify-end">
            <div className="flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
              <FiLifeBuoy className="text-xl" />
              <span className="text-sm font-medium">Sawit</span>
            </div>
          </div>

          {/* Konten Tengah */}
          <div className="flex-1 flex flex-col items-center justify-center relative z-10">
            {/* Card Putih Mengambang (Inner Card) - Palmventory Green & White Edition */}
            <div className="bg-white text-gray-900 rounded-4xl p-8 shadow-2xl w-full max-w-md mb-12 transform hover:scale-105 transition-all duration-500 border border-gray-100">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[#4A151E] text-xs font-black uppercase tracking-wider">
                      Estate Management
                    </span>
                    <h3 className="text-3xl font-extrabold leading-tight text-[#4A151E] tracking-tighter">
                      Palmventory <br />
                      <span className="opacity-70">Systems.</span>
                    </h3>
                  </div>

                  {/* Gambar Sawit Estetik (Hitam Putih atau Hijau Tua) */}
                  <div className="relative">
                    <img
                      src="/img/1.jpg"
                      alt="Aesthetic Palm Oil"
                      className="w-28 md:w-36 aspect-square object-cover shadow-xl rounded-2xl rotate-6 border-4 border-white transition-transform duration-500 hover:rotate-0"
                    />
                    {/* Overlay tipis agar gambar senada dengan tema burgundy */}
                    <div className="absolute inset-0 bg-[#4A151E]/10 rounded-2xl pointer-events-none"></div>
                  </div>
                </div>

                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  Digitalisasi pengelolaan stok operasional dan distribusi
                  barang untuk 5 lokasi kebun kelapa sawit Pak Mujiono.
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-400 uppercase font-black tracking-widest">
                      Inventory Status
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 bg-[#4A151E] rounded-full animate-pulse"></span>
                      <p className="text-sm font-bold text-[#4A151E]">
                        Fully Integrated
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase font-black tracking-widest">
                      Coverage
                    </p>
                    <p className="text-sm font-bold text-[#4A151E]">
                      5 Estates
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Teks Bawah */}
            <div className="text-center px-4">
              <h4 className="text-3xl font-bold leading-tight mb-4">
                Introducing new features
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                Analyzing previous trends ensures that businesses always make
                the right decision.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
