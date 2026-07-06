import React, { useState, useEffect } from "react";
import ModalLaporan from "../components/ModalLaporan";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RupiahFormat from "../utilities/RupiahFormat";
import FormatTanggal from "../utilities/FormatTanggal";
import api from "../utilities/axiosInterceptor";
import Detail from "../components/Laporan/Detail";

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
  const endPoint = "/get-data-laporan";

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
        const response = await api.get(`${endPoint}/${dateFrom}/${dateTo}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        //get response data
        const data = await response.data.rs_data;
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
  let rowCounter = 0;
  let ttlPembelian = 0;
  let ttlPembelianTonase = 0;
  let ttlBebanSemua = 0;
  let ttlPengiriman = 0;
  let ttlPengirimanTonase = 0;
  // detail
  const [showDetailData, setShowDetailData] = useState(false);
  const [detailTanggal, setDetailTanggal] = useState(false);

  const handleDetail = async (tanggal) => {
    setShowDetailData(!showDetailData);
    setDetailTanggal(tanggal);
  };
  //
  return (
    <>
      <div className="p-4 md:p-6 font-poppins">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 w-full mx-auto">
          {/* Header Title */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Laporan</h2>
              <p className="text-sm text-gray-500 mt-1">
                Laporan pemasukkan & pengeluaran
              </p>
            </div>
          </div>

          {/* Filters Panel */}
          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-wrap items-end gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">
                Dari
              </label>
              <input
                name="dateFrom"
                type="date"
                className="w-full sm:w-40 border border-gray-200 py-2 px-3 rounded-lg bg-white text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all text-gray-700"
                value={dateFrom}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">
                Sampai
              </label>
              <input
                name="dateTo"
                type="date"
                className="w-full sm:w-40 border border-gray-200 py-2 px-3 rounded-lg bg-white text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all text-gray-700"
                value={dateTo}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Table Container */}
          <div
            className={`overflow-x-auto rounded-xl border border-gray-200 transition-opacity duration-300 ${blur ? "opacity-50" : "opacity-100"}`}
          >
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/80 text-center border-b border-gray-200">
                  <th className="py-3.5 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-12">
                    No
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Tanggal
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-green-300">
                    Total Pembelian{" "}
                    <i className="fa fa-arrow-down text-green-500"></i>
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-green-300">
                    Tonase Pembelian{" "}
                    <i className="fa fa-arrow-down text-green-500"></i>
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-yellow-200">
                    Total beban <i className="fa fa-arrow- text-red-500"></i>
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-red-200">
                    Total Penjualan{" "}
                    <i className="fa fa-arrow-up text-red-500"></i>
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-red-200">
                    Tonase Penjualan{" "}
                    <i className="fa fa-arrow-up text-red-500"></i>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {datas.map((item, key) => {
                  rowCounter++;
                  ttlPembelian += parseInt(item.total_pembelian);
                  ttlPembelianTonase += parseInt(item.total_pembelian_tonase);
                  ttlBebanSemua += parseInt(item.total_bebanSemua);
                  ttlPengiriman += parseInt(item.total_pengiriman);
                  ttlPengirimanTonase += parseInt(item.total_pengiriman_tonase);
                  return (
                    <tr
                      onClick={() => handleDetail(item.tanggal)}
                      key={key}
                      className="group hover:bg-gray-400 transition-colors border-t-2 border-gray-100 cursor-pointer"
                    >
                      <td className="py-4 px-4 text-center text-sm font-medium text-gray-600 border-r border-gray-100">
                        {rowCounter}
                      </td>
                      <td className="py-5 px-4 align-middle text-center border-r border-gray-200 bg-gray-50/50">
                        {FormatTanggal(item.tanggal)}
                      </td>
                      <td className="py-5 px-4 align-middle text-right border-r border-gray-200 group-hover:bg-green-300 bg-green-200">
                        {RupiahFormat(item.total_pembelian)}
                      </td>
                      <td className="py-5 px-4 align-middle text-right border-r border-gray-200 group-hover:bg-green-300 bg-green-200">
                        {item.total_pembelian_tonase} Kg
                      </td>
                      <td className="py-5 px-4 align-middle text-right border-r border-gray-200 group-hover:bg-yellow-300 bg-yellow-200">
                        {RupiahFormat(item.total_bebanSemua)}
                      </td>
                      <td className="py-5 px-4 align-middle text-right border-r border-gray-200 group-hover:bg-red-300 bg-red-200">
                        {RupiahFormat(item.total_pengiriman)}
                      </td>
                      <td className="py-5 px-4 align-middle text-right border-r border-gray-200 group-hover:bg-red-300 bg-red-200">
                        {item.total_pengiriman_tonase} Kg
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td></td>
                  <td></td>
                  <td className="py-5 px-4 align-middle text-right border-r border-gray-200 group-hover:bg-green-300 bg-green-200">
                    {RupiahFormat(ttlPembelian)}
                  </td>
                  <td className="py-5 px-4 align-middle text-right border-r border-gray-200 group-hover:bg-green-300 bg-green-200">
                    {ttlPembelianTonase} Kg
                  </td>
                  <td className="py-5 px-4 align-middle text-right border-r border-gray-200 group-hover:bg-yellow-300 bg-yellow-200">
                    {RupiahFormat(ttlBebanSemua)}
                  </td>
                  <td className="py-5 px-4 align-middle text-right border-r border-gray-200 group-hover:bg-red-300 bg-red-200">
                    {RupiahFormat(ttlPengiriman)}
                  </td>
                  <td className="py-5 px-4 align-middle text-right border-r border-gray-200 group-hover:bg-red-300 bg-red-200">
                    {ttlPengirimanTonase} Kg
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <ToastContainer position="bottom-right" />
        {showDetailData && (
          <Detail
            tanggal={detailTanggal}
            isOpen={showDetailData}
            onClose={() => setShowDetailData(false)}
          />
        )}
      </div>
    </>
    //
  );
}

export default Laporan;
