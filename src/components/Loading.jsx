export default function Loading() {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-[#F4EFE6]">
            <div className="w-12 h-12 border-4 border-[#4A151E] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#4A151E] text-sm font-semibold tracking-wide">Memuat...</p>
        </div>
    );
}
