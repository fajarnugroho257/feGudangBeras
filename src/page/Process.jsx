import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RupiahFormat from "../utilities/RupiahFormat";
import FormatTanggal from "../utilities/FormatTanggal";
import api from "../utilities/axiosInterceptor";
// import ModalEditProcess from "../components/ModalEditProcess"; // Asumsikan Anda akan membuat komponen ini nanti

function Process() {
  // TOKEN
  const token = localStorage.getItem("token");
  
  const getLastDateOfMonth = () => {
    const today = new Date(); 
    const year = today.getFullYear();
    const month = today.getMonth();

    const lastDate = new Date(year, month + 1, 0);
    const date = lastDate.getDate();
    const formattedMonth = String(lastDate.getMonth() + 1).padStart(2, "0"); 
    const formattedYear = lastDate.getFullYear();

    return `${formattedYear}-${formattedMonth}-${date}`;
  };

  const lastDate = getLastDateOfMonth();

  const getFirstDateOfMonth = () => {
    const today = new Date(); 
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDate = new Date(year, month, 1);
    const date = String(firstDate.getDate()).padStart(2, "0"); 
    const formattedMonth = String(firstDate.getMonth() + 1).padStart(2, "0"); 
    const formattedYear = firstDate.getFullYear();

    return `${formattedYear}-${formattedMonth}-${date}`;
  };

  const firsttDate = getFirstDateOfMonth();

  const [dateFrom, setDateFrom] = useState(firsttDate);
  const [dateTo, setDateTo] = useState(lastDate);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 750); // Jeda 1 detik

    return () => {
      clearTimeout(handler);
    };
  }, [search]);
  
  const handleInputChange = (event) => {
    const val = event.target.value;
    const name = event.target.name;
    if (name === "dateFrom") setDateFrom(val);
    if (name === "dateTo") setDateTo(val);
    if (name === "search") setSearch(val);
  };

  const [edit_id, setEdit_id] = useState(null);
  
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const openEditModal = (process_id) => {
    setIsModalEditOpen(true);
    setEdit_id(process_id);
  };
  const closeEditModal = () => setIsModalEditOpen(false);
  
  //define state
  const [datas, setDatas] = useState([]);
  const [blur, setBlur] = useState(true);
  
  //useEffect hook
  const fectData = async () => {
    let params = {
      dateFrom: dateFrom,
      dateTo: dateTo,
      params: debouncedSearch,
    };
    setBlur(true);
    try {
      const response = await api.post("/index-process", params, {
        headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const data = await response.data.data;
      setBlur(false);
      setDatas(data || []);
    } catch (error) {
      console.error(error);
      setBlur(false);
    }
  };

  useEffect(() => {
    fectData();
  }, [
    dateFrom,
    dateTo,
    isModalEditOpen,
    debouncedSearch,
  ]);

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus data ini?");
    if (isConfirmed) {
      const toastId = toast.loading("Deleting data...");
      try {
        const response = await api.post(`/delete-process/${id}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
        if (response.status === 200) {
          fectData();
          toast.update(toastId, { render: "Delete data successfully!", type: "success", isLoading: false, autoClose: 3000 });
        } else {
          toast.update(toastId, { render: "Error delete data!" + response.status, type: "error", isLoading: false, autoClose: 5000 });
        }
      } catch (error) {
        toast.update(toastId, { render: "Error delete data! " + error.message, type: "error", isLoading: false, autoClose: 5000 });
      }
    }
  };
  
  let ttl_operational = 0;
  let ttl_input_tonase = 0;
  let ttl_output_tonase = 0;
  let local_number = 0; // Local counter for rendering

  return (
    <>
      <div className="p-1 md:p-3 xl:p-5 font-poppins">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 w-full h-full mx-auto">
          
          {/* Header & Title */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Data Proses Gabah</h2>
              <p className="text-sm text-gray-500 mt-1">Kelola data input (gabah) dan output (hasil) proses produksi</p>
            </div>
          </div>

          {/* Filters Panel */}
          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-wrap items-end gap-4 mb-6">
            <div className="flex flex-col flex-1 sm:flex-none">
              <label className="text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Dari</label>
              <input
                name="dateFrom"
                type="date"
                className="w-full sm:w-36 border border-gray-200 py-2 px-3 rounded-lg bg-white text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all text-gray-700"
                value={dateFrom}
                onChange={(event) => handleInputChange(event)}
              />
            </div>
            
            <div className="flex flex-col flex-1 sm:flex-none">
              <label className="text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Sampai</label>
              <input
                name="dateTo"
                type="date"
                className="w-full sm:w-36 border border-gray-200 py-2 px-3 rounded-lg bg-white text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all text-gray-700"
                value={dateTo}
                onChange={(event) => handleInputChange(event)}
              />
            </div>

            <div className="flex flex-col flex-1 sm:flex-none min-w-[300px]">
              <label className="text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Cari</label>
              <div className="relative">
                <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  name="search"
                  placeholder="Cari nama barang..."
                  className="w-full border border-gray-200 py-2 pl-9 pr-3 rounded-lg bg-white text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all text-gray-700"
                  value={search}
                  onChange={(event) => handleInputChange(event)}
                />
              </div>
            </div>
          </div>

          {/* ========================================= */}
          {/* VIEW MOBILE: CARD LAYOUT (Tampil < 768px)  */}
          {/* ========================================= */}
          <div className={`md:hidden space-y-4 mb-6 ${blur ? "opacity-50" : "opacity-100"} transition-opacity`}>
            {datas && datas.length > 0 ? (
              datas.map((item, index) => {
                ttl_operational += Number(item.operasional || 0);
                const inputs = item.process_input_data || item.processInputData || [];
                
                let processOutputObj = item.process_output || item.processOutput;
                if (Array.isArray(processOutputObj)) {
                  processOutputObj = processOutputObj[0];
                }
                const outputs = processOutputObj?.process_output_data || processOutputObj?.processOutputData || [];
                const outputTgl = processOutputObj?.process_output_tgl ? FormatTanggal(processOutputObj.process_output_tgl) : "-";
                
                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Header Card */}
                    <div className="bg-gray-50/80 p-4 border-b border-gray-100 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm uppercase leading-tight">Proses #{item.id}</h3>
                        <p className="text-xs text-gray-500 mt-1">{FormatTanggal(item.process_input_tgl)}</p>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-100 border border-teal-200 text-teal-700">
                          {outputs.length > 0 ? "Selesai" : "Diproses"}
                        </span>
                      </div>
                    </div>

                    {/* Tombol Aksi per Transaksi */}
                    <div className="flex border-b border-gray-100 divide-x divide-gray-100 bg-white">
                      <button onClick={() => openEditModal(item.id)} className="flex-1 py-2.5 text-yellow-500 hover:bg-yellow-50 transition-colors" title="Edit">
                        <i className="fa fa-edit text-lg"></i>
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="flex-1 py-2.5 text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                        <i className="fa fa-trash text-lg"></i>
                      </button>
                    </div>

                    {/* Operasional */}
                    <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase">Biaya Operasional</span>
                      <span className="font-bold text-red-500">{RupiahFormat(item.operasional || 0)}</span>
                    </div>

                    {/* List Input (Gabah) */}
                    <div className="p-4 space-y-3 bg-white border-b border-gray-100">
                      <span className="block text-xs font-bold text-teal-800 border-b border-gray-100 pb-2">Gabah Diproses</span>
                      {inputs.map((inData, key) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-3 border border-gray-200/60 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-gray-700 text-sm">{inData.barang?.nama}</p>
                              <p className="text-[11px] text-gray-500 mt-0.5">Supplier: {inData.supplier?.suplier_nama || inData.supplier?.nama}</p>
                            </div>
                            <span className="text-xs font-bold text-teal-700">{inData.tonase} Kg</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* List Output (Hasil) */}
                    <div className="p-4 space-y-3 bg-white">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="block text-xs font-bold text-emerald-800">Hasil Output</span>
                        <span className="text-[10px] text-gray-500">{outputTgl}</span>
                      </div>
                      {outputs.length > 0 ? outputs.map((outData, key) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-3 border border-gray-200/60 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-gray-700 text-sm">{outData.barang?.nama}</p>
                              <p className="text-[10px] bg-white px-2 py-0.5 border border-gray-200 rounded mt-1 inline-block uppercase text-gray-500">{outData.barang?.tipe}</p>
                            </div>
                            <span className="text-xs font-bold text-emerald-700">{outData.tonase} Kg</span>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-4 text-[11px] text-gray-400 border border-dashed border-gray-200 rounded-lg">Belum ada output</div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                Data tidak ditemukan
              </div>
            )}
            
            {/* Total Mobile Bawah */}
            {datas.length > 0 && (
              <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-teal-800 uppercase">Total Operasional</span>
                  <span className="text-sm font-bold text-red-600">{RupiahFormat(ttl_operational)}</span>
                </div>
              </div>
            )}
          </div>

          {/* ========================================= */}
          {/* VIEW DESKTOP: TABLE LAYOUT (Tampil > 768px) */}
          {/* ========================================= */}
          <div className={`hidden md:block overflow-x-auto rounded-lg border border-gray-200 ${blur ? "opacity-50" : "opacity-100"} transition-opacity`}>
            {/* Reset counters for desktop render */}
            <div className="hidden">
              {ttl_operational = 0}
              {ttl_input_tonase = 0}
              {ttl_output_tonase = 0}
            </div>
            
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-12">No</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-28">Tgl Input</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200 w-32">Operasional</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-64">Data Gabah (Input)</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-28">Tgl Output</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-64">Data Hasil (Output)</th>
                  <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {datas && datas.length > 0 ? datas.map((item, key) => {
                  ttl_operational += Number(item.operasional || 0);
                  local_number++;

                  const inputs = item.process_input_data || item.processInputData || [];
                  
                  let processOutputObj = item.process_output || item.processOutput;
                  if (Array.isArray(processOutputObj)) {
                    processOutputObj = processOutputObj[0];
                  }
                  const outputs = processOutputObj?.process_output_data || processOutputObj?.processOutputData || [];
                  const outputTgl = processOutputObj?.process_output_tgl ? FormatTanggal(processOutputObj.process_output_tgl) : "-";
                  
                  inputs.forEach(d => ttl_input_tonase += Number(d.tonase || 0));
                  outputs.forEach(d => ttl_output_tonase += Number(d.tonase || 0));

                  return (
                    <tr key={item.id} className="hover:bg-teal-50/20 transition-colors border-t-2 border-gray-100">
                        
                        <td className="align-top text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-3 px-2">
                          {local_number}
                        </td>
                        
                        <td className="align-top text-center border-r border-b border-gray-200 text-sm text-gray-600 py-3 px-2">
                          {FormatTanggal(item.process_input_tgl)}
                        </td>
                        
                        <td className="align-top text-right border-r border-b border-gray-200 py-3 px-3 text-sm text-red-600 font-bold bg-gray-50/30">
                          {RupiahFormat(item.operasional || 0)}
                        </td>
                        
                        <td className="align-top border-r border-b border-gray-200 py-3 px-3">
                           <div className="space-y-2">
                             {inputs.map((inData, i) => (
                               <div key={i} className="bg-gray-50 border border-gray-200 rounded p-2 text-xs flex justify-between items-center shadow-sm">
                                 <div>
                                    <p className="font-bold text-gray-700 uppercase">{inData.barang?.nama}</p>
                                    <p className="text-gray-500 mt-0.5">{inData.supplier?.suplier_nama || inData.supplier?.nama || "-"}</p>
                                 </div>
                                 <div className="font-bold text-teal-600 text-right bg-white px-2 py-1 rounded border border-gray-100">
                                    {inData.tonase} Kg
                                 </div>
                               </div>
                             ))}
                           </div>
                        </td>

                        <td className="align-top text-center border-r border-b border-gray-200 text-sm text-gray-600 py-3 px-2">
                          {outputTgl}
                        </td>

                        <td className="align-top border-r border-b border-gray-200 py-3 px-3">
                           <div className="space-y-2">
                             {outputs.length > 0 ? outputs.map((outData, i) => (
                               <div key={i} className="bg-gray-50 border border-gray-200 rounded p-2 text-xs flex justify-between items-center shadow-sm">
                                 <div>
                                    <p className="font-bold text-gray-700 uppercase">{outData.barang?.nama}</p>
                                    <p className="text-gray-500 mt-0.5 uppercase text-[10px]">{outData.barang?.tipe}</p>
                                 </div>
                                 <div className="font-bold text-emerald-600 text-right bg-white px-2 py-1 rounded border border-gray-100">
                                    {outData.tonase} Kg
                                 </div>
                               </div>
                             )) : <div className="text-center py-4 text-xs italic text-gray-400">Belum ada output</div>}
                           </div>
                        </td>

                        <td className="align-top border-b border-gray-200 p-3">
                          <div className="flex flex-wrap justify-center gap-2">
                            <button onClick={() => openEditModal(item.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors shadow-sm" title="Edit">
                              <i className="fa fa-edit text-sm"></i>
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-sm" title="Delete">
                              <i className="fa fa-trash text-sm"></i>
                            </button>
                          </div>
                        </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-gray-500 italic bg-gray-50">Data tidak ditemukan</td>
                  </tr>
                )}
                
                {/* Total Row */}
                {datas && datas.length > 0 && (
                <tr className="bg-gray-100/80 border-t-2 border-gray-300">
                    <td colSpan="2" className="text-right py-3 px-4 text-sm font-bold text-gray-700 tracking-wider border-r border-gray-300">
                      TOTAL
                    </td>
                    <td className="text-right py-3 px-3 text-sm font-bold text-red-600 border-r border-gray-200">
                      {RupiahFormat(ttl_operational)}
                    </td>
                    <td className="text-right py-3 px-4 text-sm font-bold text-teal-700 border-r border-gray-200">
                      {ttl_input_tonase} Kg
                    </td>
                    <td className="border-r border-gray-200"></td>
                    <td className="text-right py-3 px-4 text-sm font-bold text-emerald-700 border-r border-gray-200">
                      {ttl_output_tonase} Kg
                    </td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <ToastContainer position="bottom-right" />
        
        {/* Jika Anda sudah memiliki ModalEditProcess, hilangkan komentar baris di bawah */}
        {/* {isModalEditOpen && (
          <ModalEditProcess isOpen={isModalEditOpen} onClose={closeEditModal} id={edit_id} />
        )} */}
      </div>
    </>
  );
}

export default Process;