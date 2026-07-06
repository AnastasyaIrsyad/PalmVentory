import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Package, Users, Truck, BarChart3, Leaf, ArrowRight, CheckCircle, Award, Star } from "lucide-react";

// Logo
const PalmventoryLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8 md:w-9 md:h-9 text-[#4A151E]"
  >
    <path d="M12 3v4" />
    <path d="M12 9c-3-4-6-2-6 2s4 4 6 1z" />
    <path d="M12 9c3-4 6-2 6 2s-4 4-6 1z" />
    <path d="M7 13 Q12 18 17 13" />
    <path d="M8 15 Q12 19 16 15" />
    <rect x="9" y="19" width="6" height="3" rx="1" />
    <circle cx="12" cy="20" r="1" fill="#4A151E" />
  </svg>
);

export default function Landing() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const testimonials = [
    {
      image: "/img/c.jpg",
      quote: "Palmventory sangat membantu kami mengelola stok barang dan peralatan panen. Proses approval jadi jauh lebih cepat.",
      name: "Budi Santoso",
      rating: 5,
      date: "2 Juli 2026"
    },
    {
      image: "/img/b.jpg",
      quote: "Real-time tracking pengiriman TBS sangat akurat. Inventory kami sekarang lebih terorganisir dan minim kesalahan.",
      name: "Siti Rahayu",
      rating: 5,
      date: "1 Juli 2026"
    },
    {
      image: "/img/d.jpg",
      quote: "Antarmuka mudah digunakan oleh karyawan lapangan. Sangat direkomendasikan untuk perkebunan kelapa sawit.",
      name: "Ahmad Fauzi",
      rating: 4,
      date: "30 Juni 2026"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF8F2] via-[#F4EFE6] to-[#F8F1E3] font-['Plus_Jakarta_Sans',_sans-serif] overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#FBF8F2]/95 backdrop-blur-lg border-b border-[#DAB88B]/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <PalmventoryLogo />
            <div>
              <span className="text-2xl md:text-3xl font-bold text-[#4A151E] tracking-tighter">
                Palm<span className="text-[#8B2635]">ventory</span>
              </span>
              <p className="text-[9px] md:text-[10px] text-[#8B2635]/70 -mt-1">KELAPA SAWIT</p>
            </div>
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            <button onClick={() => scrollToSection('features')} className="hidden md:block text-[#4A151E] font-medium hover:text-[#8B2635] transition-colors">
              Fitur
            </button>
            <button onClick={() => scrollToSection('testimonials')} className="hidden md:block text-[#4A151E] font-medium hover:text-[#8B2635] transition-colors">
              Testimoni
            </button>
            <Link to="/login" className="text-[#4A151E] font-semibold hover:text-[#8B2635] transition-colors text-sm md:text-base">
              Masuk
            </Link>
            <Link to="/register" className="bg-[#4A151E] text-white px-5 md:px-8 py-2.5 md:py-3 rounded-2xl font-bold text-sm md:text-base hover:bg-[#3a1018] active:scale-95 transition-all">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Teks tetap di Kiri */}
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/img/a.PNG')",
            filter: "brightness(0.62) contrast(1.15)"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#4A151E]/85 via-[#4A151E]/75 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 w-full">
          <div className="max-w-xl lg:max-w-2xl text-left"> {/* Tetap kiri */}
            <div className="inline-flex items-center gap-2 bg-white/90 px-4 py-2 rounded-3xl border border-[#DAB88B]/40 mb-6 backdrop-blur-sm">
              <div className="w-2 h-2 bg-[#8B2635] rounded-full animate-pulse" />
              <span className="text-[#8B2635] text-xs md:text-sm font-bold tracking-widest uppercase">Solusi Digital Perkebunan Sawit</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tighter mb-6">
              Kelola Inventaris<br />Perkebunan 
              <span className="block text-[#F8D7A3]">Lebih Cerdas</span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 max-w-lg mb-8 leading-relaxed">
              Platform pengelola stok barang dan peralatan panen secara lebih terstruktur, cepat, dan akurat. Dirancang khusus untuk perkebunan kelapa sawit.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login" className="group flex items-center justify-center gap-3 bg-white text-[#4A151E] px-8 py-4 rounded-3xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                Mulai Sekarang
                <ArrowRight className="group-hover:translate-x-1 transition" />
              </Link>
              
              <Link to="/register" className="flex items-center justify-center border-2 border-white/80 hover:bg-white/10 text-white px-8 py-4 rounded-3xl font-bold text-lg transition-all">
                Buat Akun Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Animated Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#4A151E] overflow-hidden border-t border-[#8B2635]/30 shadow-2xl">
        <div className="flex items-center gap-12 md:gap-16 text-white/80 whitespace-nowrap animate-truck-slide-reverse py-3 md:py-4">
          <div className="flex items-center gap-6 md:gap-8 text-sm font-medium">
            <Truck size={26} className="inline" /> 
            <span>Pantau Pengiriman • Real-time Tracking • Supplier Terintegrasi</span>
            <Truck size={26} className="inline" /> 
            <span>Pantau Pengiriman • Real-time Tracking • Supplier Terintegrasi</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="pt-20 md:pt-24 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 text-[#8B2635] mb-4">
              <Award size={22} />
              <span className="uppercase tracking-[2px] text-sm font-bold">Fitur Unggulan</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2A2A2A]">Semua Kebutuhan Kebun Sawit<br className="hidden md:block" />Dalam Satu Platform</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Package, title: "Dashboard Admin", desc: "Kelola stok, validasi permintaan, dan pantau seluruh operasional kebun secara real-time", color: "#4A151E" },
              { icon: Users, title: "Panel Karyawan", desc: "Ajukan kebutuhan barang yang digunakan karyawan atas persetujuan admin", color: "#8B2635" },
              { icon: Truck, title: "Logistik & Supplier", desc: "Pantau pengiriman, kelola order supplier, dan tracking barang masuk/keluar", color: "#4A151E" },
              { icon: BarChart3, title: "Analitik Canggih", desc: "Laporan stok, prediksi kebutuhan, dan insight bisnis untuk pengambilan keputusan", color: "#8B2635" },
              { icon: CheckCircle, title: "Workflow Approval", desc: "Proses persetujuan terstruktur dan transparan dari karyawan hingga supplier", color: "#4A151E" },
              { icon: Leaf, title: "Optimized for Palmventory", desc: "Dirancang khusus untuk mengelola inventaris barang dan peralatan panen kelapa sawit secara efisien", color: "#8B2635" },
            ].map((feature, idx) => (
              <div key={idx} className="group bg-white border border-gray-100 hover:border-[#DAB88B]/60 rounded-3xl p-8 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${feature.color}15` }}>
                  <feature.icon size={32} style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-[#2A2A2A]">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-[15px]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section id="testimonials" className="py-16 md:py-20 bg-[#FBF8F2]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 text-[#8B2635] mb-4">
              <Star size={22} />
              <span className="uppercase tracking-[2px] text-sm font-bold">Testimoni Pengguna</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2A2A2A]">Apa Kata Mereka</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((item, idx) => (
              <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all">
                <img src={item.image} alt="Testimoni" className="w-full h-52 object-cover" />
                <div className="p-6 md:p-8">
                  <div className="flex mb-4">
                    {[...Array(item.rating)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                  </div>
                  <p className="text-gray-600 italic mb-6">"{item.quote}"</p>
                  <div>
                    <div className="font-semibold text-[#4A151E]">{item.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{item.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3a1018] text-white/80 py-8 relative z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <PalmventoryLogo />
            <span className="text-2xl md:text-3xl font-bold tracking-tight">Palmventory</span>
          </div>
          
          <p className="text-white/60 max-w-md mx-auto mb-8 text-sm md:text-base">
            Sistem manajemen inventaris dan logistik modern untuk perkebunan kelapa sawit Indonesia.
          </p>

          <div className="flex justify-center gap-6 md:gap-8 text-sm mb-6">
            <button onClick={() => setShowPrivacy(true)} className="hover:text-white">Kebijakan Privasi</button>
            <button onClick={() => setShowTerms(true)} className="hover:text-white">Syarat & Ketentuan</button>
          </div>

          <p className="text-xs text-white/50">© 2026 Palmventory. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 md:p-6">
          <div className="bg-white max-w-2xl w-full rounded-3xl max-h-[90vh] overflow-auto">
            <div className="p-8 md:p-10">
              <h2 className="text-3xl font-bold text-[#4A151E] mb-8">Kebijakan Privasi</h2>
              <div className="prose text-gray-600 space-y-6 text-sm md:text-base">
                <ol className="list-decimal pl-5 space-y-4">
                  <li><strong>Pengumpulan Data</strong><br />Palmventory mengumpulkan data yang diperlukan untuk pengelolaan inventaris, seperti data pengguna, data barang, pengajuan, dan riwayat transaksi.</li>
                  <li><strong>Penggunaan Data</strong><br />Data digunakan untuk mendukung proses operasional, pelaporan, dan pemantauan inventaris.</li>
                  <li><strong>Keamanan Data</strong><br />Data disimpan dengan langkah-langkah keamanan yang bertujuan menjaga kerahasiaan serta mencegah akses yang tidak sah.</li>
                  <li><strong>Kerahasiaan Informasi</strong><br />Informasi pengguna tidak akan dibagikan kepada pihak lain tanpa izin, kecuali diwajibkan oleh ketentuan hukum yang berlaku.</li>
                  <li><strong>Pembaruan Kebijakan</strong><br />Kebijakan privasi dapat diperbarui sewaktu-waktu untuk menyesuaikan perkembangan sistem.</li>
                </ol>
              </div>
              <button onClick={() => setShowPrivacy(false)} className="mt-8 w-full bg-[#4A151E] text-white py-4 rounded-2xl font-semibold">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {showTerms && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 md:p-6">
          <div className="bg-white max-w-2xl w-full rounded-3xl max-h-[90vh] overflow-auto">
            <div className="p-8 md:p-10">
              <h2 className="text-3xl font-bold text-[#4A151E] mb-8">Syarat & Ketentuan</h2>
              <div className="prose text-gray-600 space-y-6 text-sm md:text-base">
                <ol className="list-decimal pl-5 space-y-4">
                  <li><strong>Penggunaan Sistem</strong><br />Palmventory digunakan untuk mendukung pengelolaan inventaris barang dan peralatan pada lingkungan perkebunan kelapa sawit.</li>
                  <li><strong>Akun Pengguna</strong><br />Setiap pengguna bertanggung jawab menjaga kerahasiaan akun dan kata sandinya. Segala aktivitas yang dilakukan melalui akun menjadi tanggung jawab pemilik akun.</li>
                  <li><strong>Pengelolaan Data</strong><br />Pengguna wajib menginput data inventaris dan pengajuan secara benar dan sesuai kondisi sebenarnya.</li>
                  <li><strong>Hak Akses</strong><br />Hak akses sistem dibedakan berdasarkan peran pengguna, seperti administrator dan karyawan. Setiap pengguna hanya dapat mengakses fitur sesuai kewenangannya.</li>
                  <li><strong>Perubahan Sistem</strong><br />Pengembang berhak melakukan pembaruan atau perbaikan sistem untuk meningkatkan kualitas layanan.</li>
                </ol>
              </div>
              <button onClick={() => setShowTerms(false)} className="mt-8 w-full bg-[#4A151E] text-white py-4 rounded-2xl font-semibold">Tutup</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes truck-slide-reverse {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .animate-truck-slide-reverse {
          animation: truck-slide-reverse 25s linear infinite;
        }
      `}</style>
    </div>
  );
}