import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Topbar({ onMenuClick }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Menutup dropdown jika user mengklik area di luar dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Fungsi untuk menangani logout
  const handleLogout = () => {
    // Hapus token atau sesi login di sini
    localStorage.removeItem("token");
    localStorage.removeItem("page");
    
    // Arahkan kembali ke halaman login
    navigate("/login");
  };

  return (
    <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
      
      {/* Kiri: Hamburger Menu & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick} 
          className="xl:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <i className="fa fa-bars text-xl"></i>
        </button>
        
        {/* Search Bar (Tersembunyi di mobile terkecil) */}
        {/* <div className="relative w-full max-w-md hidden sm:block">
          <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input 
            type="text" 
            placeholder="Search orders, products, shipments..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-teal-300 focus:ring-4 focus:ring-teal-50 transition-all outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </div> */}
      </div>

      {/* Kanan: Hanya User Profile */}
      <div className="flex items-center" ref={dropdownRef}>
        <div className="relative">
          {/* Tombol Profile */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-teal-600 transition-colors">Admin User</p>
              <p className="text-[11px] text-gray-500 font-medium">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold border border-teal-200">
              A
            </div>
            {/* Animasi panah berputar saat diklik */}
            <i className={`fa fa-chevron-down text-xs text-gray-400 hidden md:block transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
          </div>

          {/* Dropdown Menu */}
          <div
            className={`absolute right-0 top-full mt-3 bg-white rounded-xl shadow-xl border border-gray-100 p-2 w-48 z-50 transition-all duration-200 ${
              isDropdownOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
            }`}
          >
            {/* Tombol Logout */}
            <div 
              onClick={handleLogout}
              className="px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors flex items-center gap-3"
            >
              <i className="fa fa-sign-out-alt w-4 text-center"></i> Logout
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;