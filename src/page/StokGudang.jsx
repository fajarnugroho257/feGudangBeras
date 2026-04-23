import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utilities/axiosInterceptor";

function StokGudang() {
  const token = localStorage.getItem("token");

  // ===== FILTER STATES =====
  const [barangNama, setBarangNama] = useState("");
  const [suplierNama, setSuplierNama] = useState("");
  const [tipeBarang, setTipeBarang] = useState("");
  
  const [datas, setDatas] = useState([]);
  const [blur, setBlur] = useState(true);

  // ===== LOGIKA WARNA STOK =====
  const getStockColor = (stock) => {
    if (stock < 10) return "bg-red-500 text-white font-bold"; // Sedikit (Urgent)
    if (stock <= 50) return "bg-yellow-400 text-black font-bold"; // Medium (Notice)
    return ""; // Banyak/Normal (Tanpa Indikator)
  };

  // ===== FETCH DATA =====
  const fetchData = async () => {
    try {
      setBlur(true);
      const params = {
        barang_nama: barangNama,
        suplier: suplierNama,
        tipe: tipeBarang,
      };

      const response = await api.post("/index-stock", params, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (response.status === 200) {
        setDatas(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetch stok:", error);
    } finally {
      setBlur(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [barangNama, suplierNama, tipeBarang]);

  let globalNumber = 0;

  return (
    <div className="p-1 md:p-3 xl:p-5 font-poppins">
      <div className="w-full h-full mx-auto bg-gray-50 shadow-xl p-4 md:p-8">
        
        {/* FILTER SECTION */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 items-center w-full">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-colorBlue mb-1 ml-1 uppercase">Nama Barang</label>
              <input
                type="text"
                placeholder="Cari Barang..."
                value={barangNama}
                onChange={(e) => setBarangNama(e.target.value)}
                className="w-40 border-2 py-1 px-3 rounded-md border-colorBlue text-xs md:text-sm shadow-sm outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-colorBlue mb-1 ml-1 uppercase">Supplier</label>
              <input
                type="text"
                placeholder="Cari Supplier..."
                value={suplierNama}
                onChange={(e) => setSuplierNama(e.target.value)}
                className="w-40 border-2 py-1 px-3 rounded-md border-colorBlue text-xs md:text-sm shadow-sm outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-colorBlue mb-1 ml-1 uppercase">Tipe Barang</label>
              <select
                value={tipeBarang}
                onChange={(e) => setTipeBarang(e.target.value)}
                className="w-40 border-2 py-[5px] px-3 rounded-md border-colorBlue text-xs md:text-sm shadow-sm bg-white cursor-pointer outline-none"
              >
                <option value="">Semua Tipe</option>
                <option value="beras">Beras</option>
                <option value="sekam">Sekam</option>
                <option value="katul">Katul</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="overflow-x-auto max-h-[75vh]">
          <table className={`border border-black font-poppins text-gray-700 text-xs md:text-sm w-full ${blur ? "blur-sm" : "blur-none"}`}>
            <thead className="bg-colorBlue text-white uppercase font-bold sticky top-0 z-10">
              <tr className="text-center h-12">
                <th className="border border-black w-[5%] px-2">No</th>
                <th className="border border-black px-3">Barang</th>
                <th className="border border-black px-3">Tipe</th>
                <th className="border border-black px-3">Supplier</th>
                <th className="border border-black px-3 w-[15%]">Stok</th>
              </tr>
            </thead>

            <tbody>
              {datas.length > 0 ? (
                datas.map((item) => {
                  globalNumber++;
                  const rowSpan = item.suppliers.length + 1;
                  const rowColor = globalNumber % 2 === 0 ? "bg-gray-50" : "bg-gray-200";
                  const totalStokBarang = item.suppliers.reduce((acc, sup) => acc + (sup.stok || 0), 0);

                  return (
                    <React.Fragment key={item.barang_id}>
                      <tr className={`${rowColor} hover:bg-blue-50 transition-colors`}>
                        <td className="border border-black text-center py-2" rowSpan={rowSpan}>{globalNumber}</td>
                        <td className="border border-black px-3 py-2 font-bold uppercase" rowSpan={rowSpan}>{item.barang_nama}</td>
                        <td className="border border-black text-center py-2" rowSpan={rowSpan}>
                          <span className="px-2 py-1 rounded bg-white border border-gray-300 text-[10px] uppercase font-semibold">
                            {item.tipe}
                          </span>
                        </td>
                        <td className="border border-black px-3 py-2">{item.suppliers[0]?.suplier_nama || "-"}</td>
                        {/* Kolom Stok Supplier 1 dengan Indikator Warna */}
                        <td className={`border border-black text-center py-2 ${getStockColor(item.suppliers[0]?.stok)}`}>
                          {item.suppliers[0]?.stok || 0}
                        </td>
                      </tr>

                      {item.suppliers.slice(1).map((sup) => (
                        <tr key={sup.suplier_id} className={`${rowColor} hover:bg-blue-50 transition-colors`}>
                          <td className="border border-black px-3 py-2">{sup.suplier_nama}</td>
                          {/* Kolom Stok Supplier Lain dengan Indikator Warna */}
                          <td className={`border border-black text-center py-2 ${getStockColor(sup.stok)}`}>
                            {sup.stok}
                          </td>
                        </tr>
                      ))}

                      {/* Baris Total Stok dengan Indikator Warna */}
                      <tr className={`${rowColor}`}>
                        <td className="border border-black px-3 py-2 text-right bg-black/5 uppercase text-[10px] font-bold">Total Stok</td>
                        <td className={`border border-black text-center py-2 font-bold italic ${getStockColor(totalStokBarang)}`}>
                          {totalStokBarang}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-10 border border-black italic text-gray-500 bg-white">Data tidak ditemukan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default StokGudang;