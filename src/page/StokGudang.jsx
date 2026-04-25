import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import api from "../utilities/axiosInterceptor";
import ModalAddStok from "../components/ModalAddStok";

function StokGudang() {
  const token = localStorage.getItem("token");

  const [barangNama, setBarangNama] = useState("");
  const [suplierNama, setSuplierNama] = useState("");
  const [tipeBarang, setTipeBarang] = useState("");
  const [debouncedBarang, setDebouncedBarang] = useState("");
  const [debouncedSuplier, setDebouncedSuplier] = useState("");

  const [datas, setDatas] = useState([]);
  const [blur, setBlur] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedBarang(barangNama);
      setDebouncedSuplier(suplierNama);
    }, 500);
    return () => clearTimeout(handler);
  }, [barangNama, suplierNama]);

  const renderStockBadge = (stock) => {
    if (stock < 10) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-100">
          {stock} Urgent
        </span>
      );
    }
    if (stock <= 50) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
          {stock} Low
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
        {stock} Safe
      </span>
    );
  };

  const fetchData = async () => {
    try {
      setBlur(true);
      const params = {
        barang_nama: debouncedBarang,
        suplier: debouncedSuplier,
        tipe: tipeBarang,
      };
      const response = await api.post("/index-stock", params, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setDatas(response.data.data || []);
      }
    } catch (error) {
      if (error.response?.status === 429) toast.error("Terlalu banyak permintaan.");
    } finally {
      setBlur(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedBarang, debouncedSuplier, tipeBarang]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 font-poppins">
      
      {/* Header & Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Manajemen Stok</h2>
          <p className="text-sm text-gray-500 mt-1">Laporan stok barang per kelompok supplier</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <i className="fa fa-plus"></i> Stok Awal
          </button>

          <div className="relative flex-1 md:flex-none min-w-[150px]">
            <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input
              type="text"
              placeholder="Cari Barang..."
              value={barangNama}
              onChange={(e) => setBarangNama(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all"
            />
          </div>

          <div className="relative flex-1 md:flex-none min-w-[150px]">
            <i className="fa fa-truck absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input
              type="text"
              placeholder="Supplier..."
              value={suplierNama}
              onChange={(e) => setSuplierNama(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all"
            />
          </div>

          <select
            value={tipeBarang}
            onChange={(e) => setTipeBarang(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none cursor-pointer transition-all"
          >
            <option value="">Semua Tipe</option>
            <option value="beras">Beras</option>
            <option value="sekam">Sekam</option>
            <option value="katul">Katul</option>
          </select>
        </div>
      </div>

      {/* VIEW MOBILE: CARDS (Sudah terpisah jelas) */}
      <div className={`md:hidden space-y-4 ${blur ? "opacity-50" : "opacity-100"} transition-opacity`}>
        {datas.length > 0 ? (
          datas.map((item, idx) => {
            const totalStok = item.suppliers.reduce((acc, sup) => acc + (sup.stok || 0), 0);
            return (
              <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-teal-600 p-3 flex justify-between items-center text-white">
                  <h3 className="font-bold uppercase text-xs tracking-wider">{item.barang_nama}</h3>
                  <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded uppercase">{item.tipe}</span>
                </div>
                <div className="p-4 space-y-2">
                  {item.suppliers.map((sup, sIdx) => (
                    <div key={sIdx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-600">{sup.suplier_nama || "-"}</span>
                      {renderStockBadge(sup.stok)}
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Sisa</span>
                    <div className="scale-110 origin-right">{renderStockBadge(totalStok)}</div>
                  </div>
                </div>
              </div>
            );
          })
        ) : <div className="text-center py-10 text-gray-400 text-sm">Data tidak ditemukan</div>}
      </div>

      {/* VIEW DESKTOP: TABLE DENGAN PEMBEDA SANGAT JELAS */}
      <div className={`hidden md:block overflow-x-auto rounded-xl border border-gray-200 ${blur ? "opacity-50" : "opacity-100"} transition-opacity`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100/80 border-b border-gray-300">
              <th className="py-4 px-4 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Informasi Barang</th>
              <th className="py-4 px-4 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200 text-center w-24">Tipe</th>
              <th className="py-4 px-4 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Distributor / Supplier</th>
              <th className="py-4 px-4 text-[11px] font-bold text-gray-600 uppercase tracking-wider text-right border-r border-gray-200">Stok Unit</th>
              <th className="py-4 px-4 text-[11px] font-bold text-teal-700 uppercase tracking-wider text-center bg-teal-50/50">Total Inventaris</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {datas.length > 0 ? (
              datas.map((item, index) => {
                const rowSpan = item.suppliers.length; 
                const totalStok = item.suppliers.reduce((acc, sup) => acc + (sup.stok || 0), 0);

                return (
                  <React.Fragment key={item.barang_id}>
                    <tr className="hover:bg-teal-50/5 transition-colors border-t-4 border-gray-400">
                      
                      <td className="py-5 px-4 align-middle border-r border-gray-200 bg-gray-50/50" rowSpan={rowSpan}>
                        <div className="font-extrabold text-gray-900 text-sm uppercase tracking-tight">{item.barang_nama}</div>
                        <div className="text-[10px] text-gray-400 mt-1">ID: #{item.barang_id}</div>
                      </td>
                      
                      <td className="py-5 px-4 align-middle text-center border-r border-gray-200 bg-gray-50/50" rowSpan={rowSpan}>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-teal-600 text-white uppercase tracking-widest shadow-sm">
                          {item.tipe}
                        </span>
                      </td>
                      
                      <td className="py-4 px-4 text-sm text-gray-700 font-medium border-r border-gray-100">
                        {item.suppliers[0]?.suplier_nama || "-"}
                      </td>
                      
                      <td className="py-4 px-4 text-right border-r border-gray-100">
                        {renderStockBadge(item.suppliers[0]?.stok || 0)}
                      </td>

                      {/* TOTAL STOK: Warna latar berbeda */}
                      <td className="py-5 px-4 align-middle text-center bg-teal-50/30 border-l border-gray-200" rowSpan={rowSpan}>
                        <div className="scale-100">{renderStockBadge(totalStok)}</div>
                      </td>

                    </tr>
                    
                    {/* Baris Supplier Selanjutnya: Border standar saja */}
                    {item.suppliers.slice(1).map((sup) => (
                      <tr key={sup.suplier_id} className="hover:bg-teal-50/5 transition-colors">
                        <td className="py-4 px-4 text-sm text-gray-600 font-medium border-r border-gray-100">
                          {sup.suplier_nama}
                        </td>
                        <td className="py-4 px-4 text-right border-r border-gray-100">
                          {renderStockBadge(sup.stok)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-24 text-gray-400 italic">Data inventaris barang belum tersedia</td>
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