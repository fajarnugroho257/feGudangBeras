import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", url: "/dashboard", icon: "fa-th-large" },
  { 
    name: "Master Data", 
    icon: "fa-database",
    children: [
      { name: "Barang", url: "/barang" },
      { name: "Suplier", url: "/suplier" },
    ]
  },
  { name: "Tambah Data", url: "/tambah-pembelian", icon: "fa-plus-circle" },
  { name: "Data Pembelian", url: "/pembelian", icon: "fa-shopping-bag" },
  { name: "Data Pengiriman", url: "/pengiriman", icon: "fa-truck" },
  { name: "Stok Gudang", url: "/stok-gudang", icon: "fa-warehouse" },
  { name: "Laporan", url: "/laporan", icon: "fa-chart-bar" },
  { name: "Nota Pembelian", url: "/nota", icon: "fa-file-invoice" },
];

function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  
  // Normalisasi URL aktif untuk tambah data
  let activeUri = location.pathname;
  if (["/tambah-pembelian", "/tambah-pengiriman", "/tambah-karyawan"].includes(activeUri)) {
    activeUri = "/tambah-pembelian";
  }

  const toggleSubMenu = (menuName) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  return (
    <>
      {/* Overlay untuk Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm xl:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container - Dark Slate Professional */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-slate-900 border-r border-slate-800 flex flex-col
        transform transition-transform duration-300 ease-in-out font-poppins
        xl:relative xl:translate-x-0 shadow-2xl xl:shadow-none
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        {/* Logo Area */}
        <div className="h-[72px] px-6 flex items-center justify-between shrink-0 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-teal-900/50">
              <i className="fa fa-cube text-sm"></i>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Rumah Beras</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="xl:hidden text-slate-400 hover:text-white transition-colors">
            <i className="fa fa-times text-lg"></i>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Menu Navigasi</p>
          
          {menuItems.map((item) => {
            // Jika menu memiliki Submenu (Dropdown)
            if (item.children) {
              const isChildActive = item.children.some(child => child.url === activeUri);
              const isSubMenuOpen = openMenus[item.name] || isChildActive;

              return (
                <div key={item.name} className="flex flex-col mb-1">
                  <button
                    onClick={() => toggleSubMenu(item.name)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 w-full border-l-4 ${
                      isChildActive 
                      ? "bg-slate-800 border-teal-400 text-teal-400 font-semibold" 
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <i className={`fa ${item.icon} w-5 text-center ${isChildActive ? "text-teal-400" : "text-slate-500"}`}></i>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <i className={`fa fa-chevron-down text-[10px] transition-transform duration-200 ${isSubMenuOpen ? "rotate-180 text-teal-400" : ""}`}></i>
                  </button>
                  
                  {/* Animasi Buka/Tutup Submenu */}
                  <div className={`flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isSubMenuOpen ? "max-h-40 opacity-100 mt-1 mb-2" : "max-h-0 opacity-0 mt-0"}`}>
                    {item.children.map(child => {
                      const isActive = activeUri === child.url;
                      return (
                        <Link
                          key={child.url}
                          to={child.url}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 py-2.5 pl-12 pr-4 rounded-lg text-sm mx-2 transition-colors duration-200 ${
                            isActive
                            ? "text-teal-300 font-semibold bg-slate-800/80"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-teal-400' : 'bg-slate-600'}`}></span>
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // Jika Menu Biasa (Tanpa Submenu)
            const isActive = activeUri === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 border-l-4 ${
                  isActive 
                  ? "bg-slate-800 shadow-lg shadow-slate-900/20 border-teal-400 text-teal-400 font-bold" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-transparent font-medium"
                }`}
              >
                <i className={`fa ${item.icon} w-5 text-center ${isActive ? "text-teal-400" : "text-slate-500"}`}></i>
                <span className="text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Area: Info Sistem / User */}
        <div className="p-4 m-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-center shrink-0">
           <div className="flex flex-col items-center">
             <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
               Sistem Manajemen Gudang
             </span>
             <span className="text-[11px] font-medium text-teal-400 mt-0.5">
               CID_DEV &copy; 2026
             </span>
           </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;