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
    <div className="px-5 py-3 h-[86%]">
      <div className="flex items-center">
        <div className="w-full h-fit">
          <h3 className="text-center mt-11 font-poppins text-xl xl:text-4xl font-semibold text-gray-800 w-full xl:w-2/5 mx-auto mb-10 xl:mb-20">
            Aplikasi Pencatatan Barang Masuk & Keluar{isOpen}
          </h3>
          <div className="flex items-center justify-center">
            <div className="md:w-3/5 grid grid-cols-2 gap-20 md:gap-5 md:grid-cols-4 items-center justify-center">
              <div className="relative">
                <div
                  onClick={() => handleModalTambah()}
                  className="mx-auto w-20 h-28 md:w-28 md:h-36 xl:w-36 xl:h-40 bg-colorBlue rounded-lg shadow-lg flex justify-center items-center cursor-pointer hover:bg-colorBlueHover"
                >
                  <img src={Database} className="w-[40%] h-[55%]" alt="Shop" />
                </div>
                <h3 className="text-center mt-3 text-gray-800 font-poppins font-semibold text-xs xl:text-sm">
                  Tambah Data
                </h3>
                <div
                  ref={dropdownRef}
                  className={` ${
                    isOpen ? "block" : "hidden"
                  } absolute bg-gray-100 rounded-md shadow-md shadow-gray-400 font-poppins -top-16 left-10 w-52 py-3 px-4 md:left-32`}
                >
                  <div className="">
                    <p
                      className="hover:text-colorBlueHover cursor-pointer"
                      onClick={() => handleSubmit("tambah-pembelian")}
                    >
                      Tambah Pembelian
                    </p>
                    <hr className="w-full bg-black h-[2px] my-1" />
                    <p
                      className="hover:text-colorBlueHover cursor-pointer"
                      onClick={() => handleSubmit("tambah-pengiriman")}
                    >
                      Tambah Pengiriman
                    </p>
                  </div>
                </div>
              </div>
              <div onClick={() => handleSubmit("pembelian")}>
                <div className="mx-auto w-20 h-28 md:w-28 md:h-36 xl:w-36 xl:h-40 bg-colorBlue rounded-lg shadow-lg flex justify-center items-center cursor-pointer hover:bg-colorBlueHover">
                  <img src={Shop} className="w-4/6" alt="Shop" />
                </div>
                <h3 className="text-center mt-3 text-gray-800 font-poppins font-semibold text-xs xl:text-sm">
                  Pembelian
                </h3>
              </div>
              <div onClick={() => handleSubmit("pengiriman")}>
                <div className="mx-auto w-20 h-28 md:w-28 md:h-36 xl:w-36 xl:h-40 bg-colorBlue rounded-lg shadow-lg flex justify-center items-center cursor-pointer hover:bg-colorBlueHover">
                  <img src={Shipped} className="w-4/6" alt="Shipped" />
                </div>
                <h3 className="text-center mt-3 text-gray-800 font-poppins font-semibold text-xs xl:text-sm">
                  Pengiriman
                </h3>
              </div>
              <div onClick={() => handleSubmit("laporan")}>
                <div className="mx-auto w-20 h-28 md:w-28 md:h-36 xl:w-36 xl:h-40 bg-colorBlue rounded-lg shadow-lg flex justify-center items-center cursor-pointer hover:bg-colorBlueHover">
                  <img src={Report} className="w-4/6" alt="Report" />
                </div>
                <h3 className="text-center mt-3 text-gray-800 font-poppins font-semibold text-xs xl:text-sm">
                  Laporan
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pembayaran;
