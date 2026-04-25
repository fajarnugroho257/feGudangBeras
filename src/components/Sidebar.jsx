import React, { useState, useEffect } from "react";
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage or system preference on mount
    const isDark = localStorage.getItem('darkMode') === 'true' || 
      (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
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
      {/* Dark Overlay untuk Mobile saat Sidebar terbuka */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 xl:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Box */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col
        transform transition-transform duration-300 ease-in-out
        xl:relative xl:translate-x-0 shadow-lg xl:shadow-none
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Logo Area */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              <i className="fa fa-cube text-sm"></i>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Rumah Beras</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="xl:hidden text-slate-400 hover:text-white">
            <i className="fa fa-times text-lg"></i>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-2">
          {menuItems.map((item) => {
            if (item.children) {
              const isChildActive = item.children.some(child => child.url === activeUri);
              const isSubMenuOpen = openMenus[item.name] || isChildActive;

              return (
                <div key={item.name} className="flex flex-col space-y-1">
                  <button
                    onClick={() => toggleSubMenu(item.name)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 w-full ${
                      isChildActive 
                      ? "bg-slate-800/50 text-teal-400 font-semibold shadow-sm" 
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <i className={`fa ${item.icon} w-5 text-center ${isChildActive ? "text-teal-400" : "text-slate-500"}`}></i>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <i className={`fa fa-chevron-down text-xs transition-transform duration-200 ${isSubMenuOpen ? "rotate-180" : ""}`}></i>
                  </button>
                  {isSubMenuOpen && (
                    <div className="flex flex-col pl-12 pr-4 space-y-1 mt-1">
                      {item.children.map(child => {
                        const isActive = activeUri === child.url;
                        return (
                          <Link
                            key={child.url}
                            to={child.url}
                            onClick={() => setIsOpen(false)}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                              isActive
                              ? "text-teal-400 bg-slate-800/50 font-medium"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                            }`}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = activeUri === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                  ? "bg-slate-800/50 text-teal-400 font-semibold shadow-sm" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <i className={`fa ${item.icon} w-5 text-center ${isActive ? "text-teal-400" : "text-slate-500"}`}></i>
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Area */}
        <div className="p-4 border-t border-slate-800">
          {/* <button 
            onClick={toggleDarkMode}
            className="flex items-center gap-3 text-sm text-slate-400 hover:text-slate-200 w-full px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
              <i className={`fa ${isDarkMode ? "fa-sun" : "fa-moon"} w-5 text-center`}></i> 
              <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          </button> */}
          <span className="text-white">CID &copy; 2026</span>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;