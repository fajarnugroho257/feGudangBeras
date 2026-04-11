import React, { useState } from "react";
import { Link } from "react-router-dom";
import quick from "../assets/img/calculator_6655639.png";

import Dropdown from "../components/Dropdown";
import User from "./User";
import { useLocation } from "react-router-dom";

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const [pageName, setPageName] = useState("Pembelian");
  // list header
  const header = [
    { name: "Dashboard", url: "/dashboard" },
    { name: "Tambah Data", url: "/tambah-pembelian" },
    { name: "Data Pembelian", url: "/pembelian" },
    { name: "Data Pengiriman", url: "/pengiriman" },
    { name: "Laporan", url: "/laporan" },
    { name: "Nota Pembelian", url: "/nota" },
  ];
  //
  const handleClick = (name) => {
    setPageName(name);
    setIsOpen(!isOpen);
  };
  const location = useLocation();
  let uri = location.pathname;
  if (
    uri === "/tambah-pembelian" ||
    uri === "/tambah-pengiriman" ||
    uri === "/tambah-karyawan"
  ) {
    uri = "/tambah-pembelian";
  }
  return (
    <header className=" w-full">
      <div className="flex justify-between bg-colorBlue items-center text-colorGray px-5 py-3">
        <i
          onClick={toggleSidebar}
          className="fa fa-bars cursor-pointer xl:hidden"
        ></i>
        <h3 className="md:text-xl font-semibold text-xl mdtext-4xl font-poppins">
          Putra Cabe
        </h3>
        <div className="hidden font-poppins font-normal text-color text-md xl:flex gap-16">
          {header.map((val, key) => (
            <Link
              key={key}
              to={val.url}
              className="cursor-pointer"
              onClick={() => handleClick(val.name)}
            >
              <h3 className={val.url === uri ? "active" : ""}>{val.name}</h3>
              <div className={val.url === uri ? "header-active" : ""}></div>
            </Link>
          ))}
        </div>
        <User />
      </div>
      <div
        className={`z-40 fixed top-0 left-0 h-full bg-colorBlue xl:hidden transition-transform transform ${
          isOpen ? "translate-x-0 shadow-lg shadow-black" : "-translate-x-full"
        } w-64`}
      >
        <div className="pt-4 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-colorGray text-[12px] font-poppins"></div>
          </div>
          <div>
            <i
              onClick={toggleSidebar}
              className="fa fa-times text-md text-colorGray cursor-pointer"
            ></i>
          </div>
        </div>
        <ul className="p-4">
          {header.map((val, key) => (
            <Link
              key={"head" + key}
              to={val.url}
              className="cursor-pointer font-poppins"
              onClick={() => handleClick(val.name)}
            >
              <h3
                className={
                  val.name === pageName
                    ? "text-colorGray font-semibold py-2 px-1 my-2 border border-colorGray-600 md:active"
                    : "py-2 px-1 my-2 border border-gray-600"
                }
              >
                {val.name}
              </h3>
              <div
                className={val.name === pageName ? "md:header-active" : ""}
              ></div>
            </Link>
          ))}
        </ul>
      </div>
    </header>
  );
}

export default Header;
