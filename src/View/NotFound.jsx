import PageHeader from "../components/PageHeader";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#F4EFE6] flex flex-col">
            {/* Header tetap muncul di atas */}
            <PageHeader />

            <div className="grow flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center">
                    {/* Ilustrasi Angka 404 */}
                    <div className="relative">
                        <h1 className="text-[10rem] font-black text-[#DAB88B]/40 leading-none">
                            404
                        </h1>
                        <p className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-[#4A151E] mt-6">
                            Oops!
                        </p>
                    </div>

                    {/* Pesan Kesalahan */}
                    <div className="mt-6">
                        <h2 className="text-2xl font-bold text-[#4A151E] mb-3">
                            Halaman Tidak Ditemukan
                        </h2>
                        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                            Sepertinya kamu tersesat. Halaman yang kamu cari tidak ada
                            atau telah dipindahkan.
                        </p>
                    </div>

                    {/* Tombol Kembali */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-[#4A151E] text-white px-8 py-3 rounded-2xl font-semibold text-sm shadow-lg hover:bg-[#3a1018] hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        <ArrowLeft size={18} strokeWidth={2.5} />
                        Kembali ke Dashboard
                    </Link>

                    {/* Dekorasi Tambahan */}
                    <div className="mt-12 flex justify-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#DAB88B]/50"></div>
                        <div className="w-2 h-2 rounded-full bg-[#DAB88B]"></div>
                        <div className="w-2 h-2 rounded-full bg-[#DAB88B]/50"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
