import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Shop from "../assets/img/shop.png";
import Database from "../assets/img/database.png";
import Shipped from "../assets/img/shipped.png";
import Report from "../assets/img/report.png";

function Pembayaran() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Tutup dropdown jika klik di luar elemen dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false); // Tutup dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSubmit = (event) => {
    navigate(`/${event}`);
  };

  const [isOpen, setIsOpen] = useState(false);

  const handleModalTambah = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-12 font-poppins min-h-[75vh] flex flex-col justify-center items-center">
      
      <div className="w-full text-center mb-10 xl:mb-16">
        <h2 className="text-2xl md:text-3xl xl:text-4xl font-bold text-gray-800 mb-3 tracking-tight">
          Aplikasi Pencatatan Gudang
        </h2>
        <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
          Kelola barang masuk, keluar, dan pantau persediaan gudang Anda dengan mudah.
        </p>
      </div>

      {/* Grid Menu Cards */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          
          {/* Card 1: Tambah Data (dengan Dropdown) */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={handleModalTambah}
              className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center h-40 md:h-48"
            >
              {/* Latar kontainer ikon diubah ke bg-teal-600 agar gambar putih terlihat */}
              <div className="w-14 h-14 md:w-16 md:h-16 bg-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-500 transition-colors shadow-inner">
                <img src={Database} className="w-3/5 object-contain" alt="Database" />
              </div>
              <h3 className="font-bold text-gray-700 text-xs md:text-sm text-center group-hover:text-teal-600 transition-colors uppercase tracking-wide">
                Tambah Data
              </h3>
            </div>

            {/* Dropdown Menu */}
            <div
              className={`absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 w-56 z-50 transition-all duration-200 ${
                isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
              }`}
            >
              <div 
                className="px-4 py-3 text-sm text-gray-600 font-medium hover:bg-teal-50 hover:text-teal-600 rounded-lg cursor-pointer transition-colors flex items-center gap-3"
                onClick={() => handleSubmit("tambah-pembelian")}
              >
                <i className="fa fa-shopping-bag w-4 text-center"></i> Tambah Pembelian
              </div>
              
              <hr className="my-1 border-gray-100" />
              
              <div 
                className="px-4 py-3 text-sm text-gray-600 font-medium hover:bg-teal-50 hover:text-teal-600 rounded-lg cursor-pointer transition-colors flex items-center gap-3"
                onClick={() => handleSubmit("tambah-pengiriman")}
              >
                <i className="fa fa-truck w-4 text-center"></i> Tambah Pengiriman
              </div>

              <hr className="my-1 border-gray-100" />
              
              <div 
                className="px-4 py-3 text-sm text-gray-600 font-medium hover:bg-teal-50 hover:text-teal-600 rounded-lg cursor-pointer transition-colors flex items-center gap-3"
                onClick={() => handleSubmit("barang")}
              >
                <i className="fa fa-box w-4 text-center"></i> Data Barang
              </div>

              <hr className="my-1 border-gray-100" />
              
              <div 
                className="px-4 py-3 text-sm text-gray-600 font-medium hover:bg-teal-50 hover:text-teal-600 rounded-lg cursor-pointer transition-colors flex items-center gap-3"
                onClick={() => handleSubmit("suplier")}
              >
                <i className="fa fa-users w-4 text-center"></i> Data Suplier
              </div>
            </div>
          </div>

          {/* Card 2: Pembelian */}
          <div onClick={() => handleSubmit("pembelian")}>
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center h-40 md:h-48">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-500 transition-colors shadow-inner">
                <img src={Shop} className="w-3/5 object-contain" alt="Shop" />
              </div>
              <h3 className="font-bold text-gray-700 text-xs md:text-sm text-center group-hover:text-teal-600 transition-colors uppercase tracking-wide">
                Pembelian
              </h3>
            </div>
          </div>

          {/* Card 3: Pengiriman */}
          <div onClick={() => handleSubmit("pengiriman")}>
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center h-40 md:h-48">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-500 transition-colors shadow-inner">
                <img src={Shipped} className="w-3/5 object-contain" alt="Shipped" />
              </div>
              <h3 className="font-bold text-gray-700 text-xs md:text-sm text-center group-hover:text-teal-600 transition-colors uppercase tracking-wide">
                Pengiriman
              </h3>
            </div>
          </div>

          {/* Card 4: Laporan */}
          <div onClick={() => handleSubmit("nota")}>
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center h-40 md:h-48">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-500 transition-colors shadow-inner">
                <img src={Report} className="w-3/5 object-contain" alt="Report" />
              </div>
              <h3 className="font-bold text-gray-700 text-xs md:text-sm text-center group-hover:text-teal-600 transition-colors uppercase tracking-wide">
                Nota
              </h3>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Pembayaran;