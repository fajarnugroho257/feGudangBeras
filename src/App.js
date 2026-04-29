import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import AuthRoute from "./utilities/AuthRoute";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./page/Login";
import Dashboard from "./page/Dashboard";
import Penjualan from "./page/Penjualan";
import Pembelian from "./page/Pembelian";
import Pembayaran from "./page/Pembayaran";
import Pengiriman from "./page/Pengiriman";
import StokGudang from "./page/StokGudang";
import Laporan from "./page/Laporan";
import TambahPengiriman from "./page/TambahPengiriman";
import TambahPembelian from "./page/TambahPembelian";
import TambahKaryawan from "./page/TambahKaryawan";
import TambahKardus from "./page/TambahKardus";
import Nota from "./page/Nota";
import Suplier from "./page/Suplier";
import Barang from "./page/Barang";
import Karyawan from "./page/Karyawan";
import Splash from "./Splash";

const STORAGE_KEY = "sidebar_open";
const XL_BREAKPOINT = 1280; // matches Tailwind's xl

// Reactively tracks whether viewport is xl+
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= XL_BREAKPOINT);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${XL_BREAKPOINT}px)`);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

function App() {
  const location = useLocation();
  const uri = location.pathname;
  const isAuthPage = uri === "/login" || uri === "/";

  const isDesktop = useIsDesktop();

  // Mobile: slide-in drawer
  const [isMobileOpen, setMobileOpen] = useState(false);

  // Desktop: expanded (260px) vs collapsed icon-rail (72px) — persisted
  const [isDesktopOpen, setDesktopOpen] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isDesktopOpen));
  }, [isDesktopOpen]);

  // Derive the left margin: only applies on desktop, tracks sidebar width
  const sidebarMargin = isDesktop ? (isDesktopOpen ? "260px" : "72px") : "0px";

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<AuthRoute element={<Login />} isPrivate={false} />} />
        <Route path="/" element={<AuthRoute element={<Splash />} isPrivate={false} />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-poppins text-gray-800">

      <Sidebar
        isMobileOpen={isMobileOpen}
        setMobileOpen={setMobileOpen}
        isDesktopOpen={isDesktopOpen}
        setDesktopOpen={setDesktopOpen}
      />

      {/*
        Sidebar is `fixed`, so main content needs a matching left margin on
        desktop. On mobile the sidebar is a full-screen overlay — margin = 0.
      */}
      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300"
        style={{ marginLeft: sidebarMargin }}
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/dashboard"        element={<AuthRoute element={<Dashboard />}        isPrivate={true} />} />
              <Route path="/penjualan"         element={<AuthRoute element={<Penjualan />}         isPrivate={true} />} />
              <Route path="/pembelian"         element={<AuthRoute element={<Pembelian />}         isPrivate={true} />} />
              <Route path="/pembayaran"        element={<AuthRoute element={<Pembayaran />}        isPrivate={true} />} />
              <Route path="/pengiriman"        element={<AuthRoute element={<Pengiriman />}        isPrivate={true} />} />
              <Route path="/stok-gudang"       element={<AuthRoute element={<StokGudang />}       isPrivate={true} />} />
              <Route path="/laporan"           element={<AuthRoute element={<Laporan />}           isPrivate={true} />} />
              <Route path="/tambah-pengiriman" element={<AuthRoute element={<TambahPengiriman />} isPrivate={true} />} />
              <Route path="/tambah-pembelian"  element={<AuthRoute element={<TambahPembelian />}  isPrivate={true} />} />
              <Route path="/tambah-karyawan"   element={<AuthRoute element={<TambahKaryawan />}   isPrivate={true} />} />
              <Route path="/tambah-kardus"     element={<AuthRoute element={<TambahKardus />}     isPrivate={true} />} />
              <Route path="/nota"              element={<AuthRoute element={<Nota />}             isPrivate={true} />} />
              <Route path="/suplier"           element={<AuthRoute element={<Suplier />}          isPrivate={true} />} />
              <Route path="/barang"            element={<AuthRoute element={<Barang />}           isPrivate={true} />} />
              <Route path="/karyawan"          element={<AuthRoute element={<Karyawan />}         isPrivate={true} />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;