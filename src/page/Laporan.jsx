import React, { useState, useEffect } from "react";
import ModalLaporan from "../components/ModalLaporan";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import RupiahFormat from "../utilities/RupiahFormat";
import FormatTanggal from "../utilities/FormatTanggal";
import api from "../utilities/axiosInterceptor";

function Laporan() {
  // TOKEN
  const token = localStorage.getItem("token");
  //
  const getLastDateOfMonth = () => {
    const today = new Date(); // Tanggal hari ini
    const year = today.getFullYear();
    const month = today.getMonth();

    // Mendapatkan tanggal terakhir bulan ini
    const lastDate = new Date(year, month + 1, 0);
    const date = lastDate.getDate();
    const formattedMonth = String(lastDate.getMonth() + 1).padStart(2, "0"); // Bulan dimulai dari 0, jadi ditambah 1
    const formattedYear = lastDate.getFullYear();

    return `${formattedYear}-${formattedMonth}-${date}`;
  };

  const lastDate = getLastDateOfMonth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  const start = `${year}-${month}-01`;
  const [dateFrom, setDateFrom] = useState(start);
  const [dateTo, setDateTo] = useState(lastDate);
  const [supName, setSupName] = useState("");
  const handleInputChange = (event) => {
    const name = event.target.name;
    const val = event.target.value;
    if (name === "dateFrom") {
      setDateFrom(val);
    }
    if (name === "dateTo") {
      setDateTo(val);
    }
    if (name === "suplier_nama") {
      setSupName(val);
    }
  };

  //define state
  const [datas, setDatas] = useState([]);
  let [number] = useState(1);
  const [blur, setBlur] = useState(true);
  const endPoint = "/index-Laporan";

  //useEffect hook
  useEffect(() => {
    //function "fetchData"
    let params = {
      dateFrom: dateFrom,
      dateTo: dateTo,
    };
    setBlur(true);
    const fectData = async () => {
      //fetching
      try {
        const response = await api.post(endPoint, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        //get response data
        const data = await response.data.data.data;
        // console.log(data);
        if (response.status === 200) {
          setBlur(false);
        }
        setDatas(data);
      } catch (error) {
        console.log(error.message);
      }
    };
    fectData();
  }, [dateFrom, dateTo, supName]);
  // console.log(datas);
  const [suplier_tgl, setSuplierTgl] = useState(true);
  //
  const detailLaporan = (tanggal) => {
    setIsModalOpen(!isModalOpen);
    setSuplierTgl(tanggal);
  };
  let ttl_operasional = 0;
  let ttl_ttl_pembelian = 0;
  let ttl_modal = 0;
  let ttl_pngiriman = 0;
  let ttl_laba = 0;
  //
  return (
    <div className="p-1 md:p-3 xl:p-5">
      <div className=" w-full h-full mx-auto bg-gray-50 shadow-xl p-10">
        <div className="h-[5%] md:flex items-center mb-5 justify-between">
          <div className="flex gap-1 items-center w-full">
            <input
              name="dateFrom"
              type="date"
              className="w-36 border-2 px-1 py-1 md:px-3 rounded-md border-colorBlue"
              placeholder="Dari"
              value={dateFrom}
              onChange={(event) => handleInputChange(event)}
            ></input>
            <p className="hidden md:block">Sampai</p>
            <input
              name="dateTo"
              type="date"
              className="w-36 md:mt-0 border-2 py-1 px-3 rounded-md border-colorBlue"
              placeholder="Dari"
              value={dateTo}
              onChange={(event) => handleInputChange(event)}
            ></input>
          </div>
        </div>
        <div className="h-[95%] overflow-x-scroll">
          <table
            className={`border font-poppins bg-colorBlue text-gray-700 text-xs md:text-sm w-full ${
              blur ? "blur-sm" : "blur-none"
            }`}
          >
            <thead>
              <tr
                key="tbllpoaran"
                className="text-center h-14 font-semibold text-white"
              >
                <th className="border border-black w-[5%]">No</th>
                <th className="border border-black w-[20%]">Tanggal</th>
                <th className="border border-black w-[15%]">Pembelian</th>
                <th className="border border-black w-[15%]">Operasional</th>
                <th className="border border-black w-[15%]">Modal</th>
                <th className="border border-black w-[15%]">pengiriman</th>
                <th className="border border-black w-[15%]">Laba/Rugi</th>
              </tr>
            </thead>
            <tbody>
              {datas &&
                datas.map((item, index) => {
                  const dateKey = Object.keys(item)[0]; // Ambil tanggal
                  const {
                    pembelian,
                    pengiriman,
                    grand_ttl,
                    operasional,
                    modal,
                  } = item[dateKey]; // Ambil pembelian & pengiriman untuk tanggal tersebut
                  ttl_operasional += parseInt(operasional);
                  ttl_ttl_pembelian += parseInt(pembelian.ttl_pembelian);
                  ttl_modal += parseInt(modal);
                  ttl_pngiriman += parseInt(pengiriman.ttl_pengiriman ?? 0);
                  ttl_laba += parseInt(grand_ttl);
                  return (
                    <>
                      <tr
                        key={index}
                        className={`text-right hover:bg-colorBlue hover:text-white cursor-pointer ${
                          number % 2 === 0 ? "bg-gray-50" : "bg-gray-200"
                        }`}
                        onClick={() => detailLaporan(dateKey)}
                      >
                        <td className="text-center border border-black px-2 py-1">
                          {number}
                        </td>
                        <td className="text-center border border-black px-2 py-1">
                          {FormatTanggal(dateKey)}
                        </td>
                        {/* Render pembelian data */}
                        {pembelian && (
                          <td className="border border-black px-2 py-1">
                            {RupiahFormat(pembelian.ttl_pembelian)}
                          </td>
                        )}
                        <td className="border border-black px-2 py-1">
                          {RupiahFormat(operasional)}
                        </td>
                        <td className="border border-black px-2 py-1">
                          {RupiahFormat(modal)}
                        </td>
                        {pembelian && (
                          <td className="border border-black px-2 py-1">
                            {RupiahFormat(pengiriman.ttl_pengiriman)}
                          </td>
                        )}
                        <td className="border border-black px-2 py-1">
                          {RupiahFormat(grand_ttl)}
                        </td>
                      </tr>
                      <p className="hidden">{number++}</p>
                    </>
                  );
                })}
              <tr className="font-semibold text-white">
                <td
                  colSpan="2"
                  className="border border-black px-2 py-1 text-right"
                >
                  Total
                </td>
                <td className="border border-black px-2 py-1 text-right">
                  {RupiahFormat(ttl_ttl_pembelian)}
                </td>
                <td className="border border-black px-2 py-1 text-right">
                  {RupiahFormat(ttl_operasional)}
                </td>
                <td className="border border-black px-2 py-1 text-right">
                  {RupiahFormat(ttl_modal)}
                </td>
                <td className="border border-black px-2 py-1 text-right">
                  {RupiahFormat(ttl_pngiriman)}
                </td>
                <td className="border border-black px-2 py-1 text-right">
                  {RupiahFormat(ttl_laba)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer />
      {isModalOpen && (
        <ModalLaporan
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(!isModalOpen)}
          suplier_tgl={suplier_tgl}
        />
      )}
    </div>
    //
  );
}

export default Laporan;
