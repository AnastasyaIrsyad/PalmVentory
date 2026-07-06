import React from "react";
import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

// Header ringkas untuk halaman publik/di luar dashboard (mis. halaman 404)
export default function PageHeader({ title = "Palmventory", breadcrumb }) {
  return (
    <header className="w-full bg-[#4A151E] px-6 py-4 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="bg-[#DAB88B] p-2 rounded-xl">
            <Leaf className="text-[#4A151E]" size={18} fill="currentColor" />
          </div>
          <span className="text-lg font-bold text-[#F4EFE6] tracking-tight">
            {title}
          </span>
        </Link>

        {Array.isArray(breadcrumb) && breadcrumb.length > 0 && (
          <nav className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-wide text-[#DAB88B]/80">
            {breadcrumb.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span>/</span>}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
