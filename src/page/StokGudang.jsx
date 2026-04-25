import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import api from "../utilities/axiosInterceptor";
import ModalAddStok from "../components/ModalAddStok";

function StokGudang() {
  const token = localStorage.getItem("token");

  const [barangNama, setBarangNama] = useState("");
  const [suplierNama, setSuplierNama] = useState("");
  const [tipeBarang, setTipeBarang] = useState("");
  const [datas, setDatas] = useState([]);
  const [blur, setBlur] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Indikator visual UI untuk urgensi stok (Pill Badges)
  const renderStockBadge = (stock) => {
    if (stock < 10) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
          {stock} Urgent
        </span>
      );
    }
    if (stock <= 50) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
          {stock} Low
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
        {stock} Safe
      </span>
    );
  };

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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 font-poppins">
      
      {/* Header & Actions */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Stok Manajemen</h2>
          <p className="text-sm text-gray-500 mt-1">Pantau persediaan barang dan supplier</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Tambah Stok Awal Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <i className="fa fa-plus"></i> Tambah Stok Awal
          </button>

          {/* Filter Barang */}
          <div className="relative w-full md:w-auto flex-1 md:flex-none">
            <i className="fa fa-box absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              placeholder="Cari Barang..."
              value={barangNama}
              onChange={(e) => setBarangNama(e.target.value)}
              className="w-full md:w-44 pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
            />
          </div>

          {/* Filter Supplier */}
          <div className="relative w-full md:w-auto flex-1 md:flex-none">
            <i className="fa fa-truck absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              placeholder="Cari Supplier..."
              value={suplierNama}
              onChange={(e) => setSuplierNama(e.target.value)}
              className="w-full md:w-44 pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
            />
          </div>

          {/* Filter Tipe */}
          <select
            value={tipeBarang}
            onChange={(e) => setTipeBarang(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none cursor-pointer"
          >
            <option value="">Semua Tipe</option>
            <option value="beras">Beras</option>
            <option value="sekam">Sekam</option>
            <option value="katul">Katul</option>
          </select>
        </div>
      </div>

      {/* TAMPILAN MOBILE (Cards Layout) - Tetap sama */}
      <div className={`md:hidden space-y-4 ${blur ? "opacity-50" : "opacity-100"} transition-opacity`}>
        {datas.length > 0 ? (
          datas.map((item, idx) => {
            const totalStok = item.suppliers.reduce((acc, sup) => acc + (sup.stok || 0), 0);
            return (
              <div key={idx} className="border border-gray-100 rounded-xl p-4 shadow-sm bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 uppercase">{item.barang_nama}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">{item.tipe}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {item.suppliers.map((sup, sIdx) => (
                    <div key={sIdx} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-sm">
                      <span className="text-gray-600 font-medium">{sup.suplier_nama || "-"}</span>
                      {renderStockBadge(sup.stok)}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Stok</span>
                  <div>{renderStockBadge(totalStok)}</div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100 text-sm">
            Data tidak ditemukan
          </div>
        )}
      </div>

      {/* TAMPILAN DESKTOP (Modern Table Layout) - Diperbarui */}
      <div className={`hidden md:block overflow-x-auto ${blur ? "opacity-50" : "opacity-100"} transition-opacity`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Barang</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipe</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Stok per Supplier</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center border-l border-gray-200">Total Stok</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {datas.length > 0 ? (
              datas.map((item) => {
                // rowSpan sekarang pas sama jumlah supplier (tidak perlu +1 lagi)
                const rowSpan = item.suppliers.length; 
                const totalStok = item.suppliers.reduce((acc, sup) => acc + (sup.stok || 0), 0);

                return (
                  <React.Fragment key={item.barang_id}>
                    {/* Baris Pertama: Menampilkan data Barang, Supplier 1, dan Kolom Total Stok */}
                    <tr className="hover:bg-blue-50/30 transition-colors border-t-2 border-gray-100">
                      
                      <td className="py-4 px-4 align-middle" rowSpan={rowSpan}>
                        <div className="font-bold text-gray-800 uppercase">{item.barang_nama}</div>
                      </td>
                      
                      <td className="py-4 px-4 align-middle" rowSpan={rowSpan}>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 uppercase border border-gray-200">
                          {item.tipe}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4 text-sm text-gray-600 font-medium">
                        {item.suppliers[0]?.suplier_nama || "-"}
                      </td>
                      
                      <td className="py-3 px-4 text-right">
                        {renderStockBadge(item.suppliers[0]?.stok || 0)}
                      </td>

                      {/* Kolom Baru: Total Stok (Di-merge menggunakan rowSpan) */}
                      <td className="py-4 px-4 align-middle text-center border-l border-gray-100 bg-gray-50/30" rowSpan={rowSpan}>
                        {renderStockBadge(totalStok)}
                      </td>

                    </tr>
                    
                    {/* Baris Supplier Selanjutnya (Hanya Supplier & Stok Supplier) */}
                    {item.suppliers.slice(1).map((sup) => (
                      <tr key={sup.suplier_id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-600 font-medium border-l border-gray-50">
                          {sup.suplier_nama}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {renderStockBadge(sup.stok)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-12 text-gray-500 italic bg-gray-50 rounded-lg border-t border-gray-100">
                  Data tidak ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ModalAddStok isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} reload={fetchData} />
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default StokGudang;