import React from "react";
import { Link } from "react-router-dom";

const HoverDropdown = () => {
  return (
    <div className="">
      {/* Container utama dengan class 'group' */}
      <div className="relative inline-block group">
        {/* Tombol Pemicu */}
        <span>Master Data</span>

        {/* Menu Dropdown */}
        {/* 'hidden' secara default, 'block' saat parent di-hover */}
        <div className="absolute left-0 hidden group-hover:block w-48 bg-white border border-gray-200 rounded-md shadow-xl z-20">
          <div className="py-2">
            <Link
              to={"suplier"}
              className="block px-4 py-2 text-gray-800 hover:bg-colorBlue hover:text-white transition-colors"
            >
              Suplier
            </Link>
            <Link
              to={"barang"}
              className="block px-4 py-2 text-gray-800 hover:bg-colorBlue hover:text-white transition-colors"
            >
              Barang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoverDropdown;
