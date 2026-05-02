import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", url: "/dashboard", icon: "fa-th-large" },
  {
    name: "Master Data",
    icon: "fa-database",
    children: [
      {
        group: "Gudang",
        icon: "fa-boxes",
        items: [
          { name: "Barang", url: "/barang" },
          { name: "Suplier", url: "/suplier" },
        ],
      },
      {
        group: "Karyawan",
        icon: "fa-users",
        items: [
          { name: "Karyawan", url: "/karyawan" },
        ],
      },
    ],
  },
  { name: "Tambah Data",     url: "/tambah-pembelian", icon: "fa-plus-circle" },
  { name: "Data Pembelian",  url: "/pembelian",         icon: "fa-shopping-bag" },
  { name: "Data Pengiriman", url: "/pengiriman",        icon: "fa-truck" },
  { name: "Stok Gudang",     url: "/stok-gudang",       icon: "fa-warehouse" },
  // { name: "Laporan",         url: "/laporan",           icon: "fa-chart-bar" },
  { name: "Nota Pembelian",  url: "/nota",              icon: "fa-file-invoice" },
];

// Animated 3-bars → X hamburger
function HamburgerButton({ isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Tutup menu" : "Buka menu"}
      className={`
        w-8 h-8 flex flex-col items-center justify-center gap-[3.5px] 
        rounded-full border transition-all duration-300 shrink-0
        ${isOpen 
          ? "bg-slate-800/40 border-slate-700/50 text-slate-400" 
          : "bg-teal-500/5 border-teal-500/20 text-teal-500/80"
        }
        hover:bg-teal-600 hover:text-white hover:border-teal-500 hover:shadow-md
      `}
    >
      {/* Garis Atas Panah */}
      <span className={`block h-[1.5px] bg-current rounded-full transition-all duration-300 origin-center
        ${isOpen 
          ? "w-2.5 -rotate-45 -translate-x-[3px] translate-y-[1px]" 
          : "w-2.5 rotate-45 translate-x-[3px] translate-y-[1px]"
        }`} 
      />

      {/* Baris Tengah (Batang Panah) */}
      <span className="block h-[1.5px] w-4 bg-current rounded-full transition-all duration-300" />

      {/* Garis Bawah Panah */}
      <span className={`block h-[1.5px] bg-current rounded-full transition-all duration-300 origin-center
        ${isOpen 
          ? "w-2.5 rotate-45 -translate-x-[3px] -translate-y-[1px]" 
          : "w-2.5 -rotate-45 translate-x-[3px] -translate-y-[1px]"
        }`} 
      />
    </button>
  );
}

function Sidebar({ isMobileOpen, setMobileOpen, isDesktopOpen, setDesktopOpen }) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const sidebarRef = useRef(null);

  const showContent = isMobileOpen || isDesktopOpen;

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        if (!showContent) {
          setOpenMenus({});
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showContent]);

  let activeUri = location.pathname;
  if (["/tambah-pembelian", "/tambah-pengiriman", "/tambah-karyawan"].includes(activeUri)) {
    activeUri = "/tambah-pembelian";
  }

  const toggleSubMenu = (key) =>
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLinkClick = () => {
    setMobileOpen(false);
    setOpenMenus({});
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm xl:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/*
        Mobile  : fixed, slides in/out via translate, full 260px width
        Desktop : fixed, always visible — wide (260px) or narrow icon-rail (72px)
      */}
      <aside ref={sidebarRef} className={`
        fixed inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800
        flex flex-col font-poppins shadow-2xl
        transition-all duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0 w-[260px]" : "-translate-x-full w-[260px]"}
        xl:translate-x-0
        ${isDesktopOpen ? "xl:w-[260px]" : "xl:w-[72px]"}
      `}>

        {/* Header: logo + hamburger */}
        <div className="h-[72px] px-3 flex items-center justify-between shrink-0 border-b border-slate-800/80 gap-2">

          {/* Logo — visible when expanded */}
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300
            ${showContent ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0"}`}>
            <div className="w-8 h-8 shrink-0 bg-teal-500 rounded-lg flex items-center justify-center
              text-white font-bold shadow-md shadow-teal-900/50">
              <i className="fa fa-cube text-sm"></i>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight whitespace-nowrap">Rumah Beras</h1>
          </div>

          {/* Cube icon — only when desktop collapsed */}
          <div className={`shrink-0 transition-all duration-300
            ${!isDesktopOpen && !isMobileOpen ? "xl:block hidden" : "hidden"}`}>
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center
              text-white font-bold shadow-md shadow-teal-900/50">
              <i className="fa fa-cube text-sm"></i>
            </div>
          </div>

          {/* Mobile close button (X) — only on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="xl:hidden text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <i className="fa fa-times text-lg"></i>
          </button>

          {/* Desktop hamburger — only on xl+ */}
          <div className="hidden xl:block">
            <HamburgerButton
              isOpen={isDesktopOpen}
              onClick={() => setDesktopOpen((prev) => !prev)}
            />
          </div>
        </div>

        {/* Nav */}
        <nav className={`flex-1 px-2 py-5 custom-scrollbar ${showContent ? "overflow-y-auto overflow-x-hidden" : "overflow-visible"}`}>
          <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3
            transition-opacity duration-200 ${showContent ? "opacity-100" : "opacity-0"}`}>
            Menu Navigasi
          </p>

          {menuItems.map((item) => {

            // ── Grouped dropdown ─────────────────────────────────────────
            if (item.children) {
              const allChildUrls  = item.children.flatMap((g) => g.items.map((i) => i.url));
              const isChildActive = allChildUrls.includes(activeUri);
              const isSubMenuOpen = showContent 
                ? (openMenus[item.name] ?? isChildActive)
                : (openMenus[item.name] === true);

              return (
                <div key={item.name} className="flex flex-col mb-1 group relative">
                  <button
                    onClick={() => toggleSubMenu(item.name)}
                    title={!showContent ? item.name : undefined}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl
                      transition-all duration-300 w-full border-l-4 ${
                      isChildActive
                        ? "bg-slate-800 border-teal-400 text-teal-400 font-semibold"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <i className={`fa ${item.icon} w-5 text-center shrink-0
                        ${isChildActive ? "text-teal-400" : "text-slate-500"}`}></i>
                      <span className={`text-sm whitespace-nowrap transition-all duration-200
                        ${showContent ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                        {item.name}
                      </span>
                    </div>
                    {showContent && (
                      <i className={`fa fa-chevron-down text-[10px] transition-transform duration-200 shrink-0
                        ${isSubMenuOpen ? "rotate-180 text-teal-400" : ""}`}></i>
                    )}
                  </button>

                  {/* Groups — only when expanded */}
                  <div className={`flex flex-col overflow-hidden transition-all duration-300 ease-in-out
                    ${showContent && isSubMenuOpen ? "max-h-72 opacity-100 mt-1 mb-2" : "max-h-0 opacity-0"}`}>
                    {item.children.map((group) => {
                      const isGroupActive = group.items.some((i) => i.url === activeUri);
                      const groupKey      = `${item.name}__${group.group}`;
                      const isGroupOpen   = openMenus[groupKey] ?? isGroupActive;

                      return (
                        <div key={group.group} className="mx-2 mb-1">
                          <button
                            type="button"
                            onClick={() => toggleSubMenu(groupKey)}
                            className={`flex items-center justify-between w-full gap-2 px-3 py-1.5 mb-0.5
                              rounded-lg transition-colors duration-200 ${
                              isGroupActive
                                ? "text-teal-400 bg-slate-800/40"
                                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <i className={`fa ${group.icon} text-[10px]`}></i>
                              <span className="text-[10px] font-bold uppercase tracking-widest">
                                {group.group}
                              </span>
                            </div>
                            <i className={`fa fa-chevron-down text-[9px] transition-transform duration-200
                              ${isGroupOpen ? "rotate-180" : ""}`}></i>
                          </button>

                          <div className={`flex flex-col overflow-hidden transition-all duration-200 ease-in-out
                            ${isGroupOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                            {group.items.map((child) => {
                              const isActive = activeUri === child.url;
                              return (
                                <Link
                                  key={child.url}
                                  to={child.url}
                                  onClick={handleLinkClick}
                                  className={`flex items-center gap-3 py-2 pl-8 pr-4 rounded-lg text-sm
                                    transition-colors duration-200 ${
                                    isActive
                                      ? "text-teal-300 font-semibold bg-slate-800/80"
                                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0
                                    ${isActive ? "bg-teal-400" : "bg-slate-600"}`}></span>
                                  {child.name}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Floating Dropdown for Collapsed State */}
                  {!showContent && isSubMenuOpen && (
                    <div className="absolute left-full top-0 ml-2 block z-50">
                      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-3 w-48 relative">
                        {/* Triangle pointer */}
                        <div className="absolute top-4 -left-2 w-4 h-4 bg-slate-800 border-l border-b border-slate-700 rotate-45"></div>
                        
                        <div className="text-xs font-bold text-slate-400 mb-3 px-1 uppercase tracking-wider">{item.name}</div>
                        {item.children.map((group) => (
                          <div key={group.group} className="mb-3 last:mb-0 relative z-10">
                            <div className="text-[10px] text-teal-400 font-bold px-1 mb-1.5 uppercase tracking-widest">{group.group}</div>
                            {group.items.map((child) => {
                              const isActive = activeUri === child.url;
                              return (
                                <Link
                                  key={child.url}
                                  to={child.url}
                                  onClick={handleLinkClick}
                                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                                    isActive
                                      ? "text-white font-semibold bg-slate-700/80"
                                      : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                                  }`}
                                >
                                  {child.name}
                                </Link>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // ── Regular item ─────────────────────────────────────────────
            const isActive = activeUri === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                onClick={handleLinkClick}
                title={!showContent ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-3 mb-1 rounded-xl
                  transition-all duration-300 border-l-4 ${
                  isActive
                    ? "bg-slate-800 shadow-lg shadow-slate-900/20 border-teal-400 text-teal-400 font-bold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-transparent font-medium"
                }`}
              >
                <i className={`fa ${item.icon} w-5 text-center shrink-0
                  ${isActive ? "text-teal-400" : "text-slate-500"}`}></i>
                <span className={`text-sm tracking-wide whitespace-nowrap transition-all duration-200
                  ${showContent ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-4 m-3 bg-slate-800/50 rounded-xl border border-slate-700/50
          flex items-center justify-center shrink-0 transition-all duration-300
          ${showContent ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase whitespace-nowrap">
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