import React, { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

// --- Import Utilities ---
import AuthRoute from "./utilities/AuthRoute";

// --- Import Layout Components ---
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

// --- Import Pages ---
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
import Splash from "./Splash";

function App() {
  const location = useLocation();
  const uri = location.pathname;
  const isAuthPage = uri === "/login" || uri === "/";
  
  // State untuk kontrol Sidebar di Mobile
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Jika di halaman Login/Splash, jangan tampilkan layout Dashboard
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
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Topbar Component */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/dashboard" element={<AuthRoute element={<Dashboard />} isPrivate={true} />} />
              <Route path="/penjualan" element={<AuthRoute element={<Penjualan />} isPrivate={true} />} />
              <Route path="/pembelian" element={<AuthRoute element={<Pembelian />} isPrivate={true} />} />
              <Route path="/pembayaran" element={<AuthRoute element={<Pembayaran />} isPrivate={true} />} />
              <Route path="/pengiriman" element={<AuthRoute element={<Pengiriman />} isPrivate={true} />} />
              <Route path="/stok-gudang" element={<AuthRoute element={<StokGudang />} isPrivate={true} />} />
              <Route path="/laporan" element={<AuthRoute element={<Laporan />} isPrivate={true} />} />
              <Route path="/tambah-pengiriman" element={<AuthRoute element={<TambahPengiriman />} isPrivate={true} />} />
              <Route path="/tambah-pembelian" element={<AuthRoute element={<TambahPembelian />} isPrivate={true} />} />
              <Route path="/tambah-karyawan" element={<AuthRoute element={<TambahKaryawan />} isPrivate={true} />} />
              <Route path="/tambah-kardus" element={<AuthRoute element={<TambahKardus />} isPrivate={true} />} />
              <Route path="/nota" element={<AuthRoute element={<Nota />} isPrivate={true} />} />
              <Route path="/suplier" element={<AuthRoute element={<Suplier />} isPrivate={true} />} />
              <Route path="/barang" element={<AuthRoute element={<Barang />} isPrivate={true} />} />
            </Routes>
          </div>
        </main>

      </div>
    </div>
  );
}

export default App;