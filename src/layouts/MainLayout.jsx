import "../assets/tailwind.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LoginSuccessToast from "../components/LoginSuccessToast";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div id="app-container" className="min-h-screen relative bg-[#2A0D12] text-[#F4EFE6]">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #34101A, #2A0D12, #220A0F)' }} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at top left, rgba(218,184,139,0.14), transparent 28%), radial-gradient(circle at bottom right, rgba(255,255,255,0.05), transparent 24%)',
        }}
      />

      <div className="relative z-10 flex w-full min-h-screen">
        <Sidebar />
        <div id="main-content" className="flex-1 flex flex-col min-h-screen overflow-y-auto p-6 xl:p-8 ml-72">
          <Header />
          <main className="flex-1 pb-4">
            <div className="rounded-2xl border border-[#DAB88B]/15 bg-[#FBF8F2] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.30)] h-full overflow-y-auto">
              <LoginSuccessToast />
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
