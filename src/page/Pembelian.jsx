import React, { useState, useEffect } from "react";
import ModalAddPembelian from "../components/ModalAddPembelian";
import ModalEditPembelian from "../components/ModalEditPembelian";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RupiahFormat from "../utilities/RupiahFormat";
import FormatTanggal from "../utilities/FormatTanggal";
import ModalPreview from "../components/ModalPreview";
import api from "../utilities/axiosInterceptor";

function Pembelian() {
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

  const [edit_id, setEdit_id] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState(firsttDate);
  const [dateTo, setDateTo] = useState(lastDate);
  const [supName, setSupName] = useState("");
  const [pembayaran, setPembayaran] = useState("");
  const [debouncedSupName, setDebouncedSupName] = useState("");

  // LOGIKA DEBOUNCE: Menunggu user berhenti mengetik selama 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSupName(supName);
    }, 750);

    return () => {
      clearTimeout(handler);
    };
  }, [supName]);
  
  const handleInputChange = (event) => {
    const name = event.target.name;
    const val = event.target.value;
    if (name === "dateFrom") setDateFrom(val);
    if (name === "dateTo") setDateTo(val);
    if (name === "suplier_nama") setSupName(val);
    if (name === "pembayaran") setPembayaran(val);
  };

  const closeModal = () => setIsModalOpen(false);
  
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [draftNota, setDraftNota] = useState(false);
  const openEditModal = (id) => {
    setIsModalEditOpen(true);
    setEdit_id(id);
  };
  const closeEditModal = () => {
    fectData();
    setIsModalEditOpen(false);
  };

  const [datas, setDatas] = useState([]);
  let number = 0;
  const [blur, setBlur] = useState(true);
  
  const fectData = async () => {
    try {
      let params = {
        dateFrom: dateFrom,
        dateTo: dateTo,
        supName: debouncedSupName,
        pembayaran: pembayaran,
      };
      const response = await api.post("index-Pembelian", params, {
        headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const data = await response.data.data;
      if (response.status === 200) {
        setBlur(false);
      }
      setDatas(data);
    } catch (error) {
      console.error("Error fetching pembelian data:", error);
      setBlur(false);
    }
  };

  useEffect(() => {
    setBlur(true);
    fectData();
    setDraftNota(false);
  }, [dateFrom, dateTo, debouncedSupName, pembayaran, draftNota]);

  let ttl_harga = 0;
  let ttl_total = 0;
  let ttl_tonase_kotor = 0;
  let ttl_tonase_potongan = 0;
  let ttl_tonase_bersih = 0;

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus data ini?");
    if (isConfirmed) {
      const toastId = toast.loading("Sending data...");
      try {
        const params = { id: id };
        const response = await api.post("/delete-Pembelian", params, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        if (response.status === 200) {
          toast.update(toastId, {
            render: "Delete data successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          fectData();
        } else {
          toast.update(toastId, {
            render: "Error delete data!" + response.status,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
      } catch (error) {
        toast.update(toastId, {
          render: "Error delete data! " + error.message,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        console.error("Error posting data:", error);
      }
    }
  };
  
  const downloadImage = async (id) => {
    const toastId = toast.loading("Sending data...");
    try {
      const response = await api.get(`/test-cetak-image/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", 
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Pembelian" + id + ".png"); 
      document.body.appendChild(link);
      link.click(); 
      document.body.removeChild(link); 

      if (response.status === 200) {
        toast.update(toastId, { render: "Download successfully!", type: "success", isLoading: false, autoClose: 3000 });
      } else {
        toast.update(toastId, { render: "Error Download!" + response.status, type: "error", isLoading: false, autoClose: 5000 });
      }
    } catch (error) {
      toast.update(toastId, { render: "Error Download! " + error.message, type: "error", isLoading: false, autoClose: 5000 });
    }
  };

  const downloadLaporan = async () => {
    let params = { dateFrom: dateFrom, dateTo: dateTo, supName: supName, pembayaran: pembayaran };
    const toastId = toast.loading("Download data...");
    try {
      const response = await api.post(`/cetak-laporan`, params, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", 
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Laporan-Pembelian.pdf"); 
      document.body.appendChild(link);
      link.click(); 
      document.body.removeChild(link); 

      if (response.status === 200) {
        toast.update(toastId, { render: "Download successfully!", type: "success", isLoading: false, autoClose: 3000 });
      } else {
        toast.update(toastId, { render: "Error Download!" + response.status, type: "error", isLoading: false, autoClose: 5000 });
      }
    } catch (error) {
      toast.update(toastId, { render: "Error Download! " + error.message, type: "error", isLoading: false, autoClose: 5000 });
    }
  };

  const [selectedIds, setSelectedIds] = useState([]);
  const handleCheckboxChange = (id, index) => {
    setSelectedIds(
      (prevSelected) =>
        prevSelected.includes(id)
          ? prevSelected.filter((itemId) => itemId !== id) 
          : [...prevSelected, id], 
    );
    const values = [...datas];
    values[index]["suplier_nota_st"] = values[index]["suplier_nota_st"] === "yes" ? "no" : "yes";
    setDatas(values);
  };

  const buatNota = async () => {
    if (selectedIds.length < 1) {
      alert("Harus memilih setidaknya 1 data untuk dibuat nota");
    } else {
      const toastId = toast.loading("Getting data...");
      try {
        const params = { selectedIds: selectedIds };
        const response = await api.post("/make-draft-nota", params, {
          headers: {
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        if (response.status === 200) {
          setDraftNota(true);
          setSelectedIds([]);
          if (response.data.success === true) {
            toast.update(toastId, { render: response.data.message, type: "success", isLoading: false, autoClose: 3000 });
          } else {
            toast.update(toastId, { render: "Error make nota, Suplier ID sudah tersedia : " + response.data.message, type: "error", isLoading: false, autoClose: 5000 });
          }
        } else {
          toast.update(toastId, { render: "Error make nota: " + response.message, type: "error", isLoading: false, autoClose: 5000 });
        }
      } catch (error) {
        toast.update(toastId, { render: "Error getting data! " + error.message, type: "error", isLoading: false, autoClose: 5000 });
      }
    }
  };

  const [isModalCetak, setIsModalCetak] = useState(false);
  const viewModalCetak = (id) => {
    setIsModalCetak(!isModalCetak);
    setEdit_id(id);
  };

  return (
    <div className="p-1 md:p-3 xl:p-5 font-poppins">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 w-full h-full mx-auto">
        
        {/* Header & Actions */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Data Pembelian</h2>
            <p className="text-sm text-gray-500 mt-1">Kelola transaksi dan cetak nota</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => buatNota()}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <i className="fa fa-book"></i> Buat Nota
            </button>
            <button
              onClick={() => downloadLaporan()}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <i className="fa fa-download"></i> Download Laporan
            </button>
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

          <div className="flex flex-col flex-1 sm:flex-none min-w-[200px]">
            <label className="text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Supplier</label>
            <div className="relative">
              <i className="fa fa-users absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                name="suplier_nama"
                placeholder="Cari Suplier..."
                className="w-full border border-gray-200 py-2 pl-9 pr-3 rounded-lg bg-white text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all text-gray-700"
                value={supName}
                onChange={(event) => handleInputChange(event)}
              />
            </div>
          </div>

          <div className="flex flex-col flex-1 sm:flex-none">
            <label className="text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Status</label>
            <select
              name="pembayaran"
              className="w-full sm:w-36 border border-gray-200 py-2 px-3 rounded-lg bg-white text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all cursor-pointer text-gray-700"
              onChange={(event) => handleInputChange(event)}
            >
              <option value="">Semua</option>
              <option value="cash">Cash</option>
              <option value="hutang">Hutang</option>
            </select>
          </div>
        </div>

        {/* ========================================= */}
        {/* VIEW MOBILE: CARD LAYOUT (Tampil < 768px)  */}
        {/* ========================================= */}
        <div className={`md:hidden space-y-4 mb-6 ${blur ? "opacity-50" : "opacity-100"} transition-opacity`}>
          {datas && datas.length > 0 ? (
            datas.map((item, index) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                
                {/* Header Card (Supplier & Nota) */}
                <div className="bg-gray-50/80 p-4 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800 text-base uppercase leading-tight">{item.suplier_nama}</h3>
                    <p className="text-xs text-gray-500 mt-1">{FormatTanggal(item.pembelian_tgl)}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cetak Nota</span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-teal-600 bg-gray-50 border-gray-300 rounded focus:ring-teal-500 cursor-pointer disabled:opacity-50"
                      name="suplier_nota_st"
                      onChange={(event) => handleCheckboxChange(item.id, index)}
                      checked={item.suplier_nota_st === "yes"}
                      disabled={item.suplier_nota_st === "yes"}
                    />
                  </div>
                </div>

                {/* Tombol Aksi per Suplier */}
                <div className="flex border-b border-gray-100 divide-x divide-gray-100 bg-white">
                  <button onClick={() => downloadImage(item.id)} className="flex-1 py-2.5 text-blue-500 hover:bg-blue-50 transition-colors" title="Image">
                    <i className="fa fa-image text-lg"></i>
                  </button>
                  <button onClick={() => viewModalCetak(item.id)} className="flex-1 py-2.5 text-green-500 hover:bg-green-50 transition-colors" title="Print">
                    <i className="fa fa-download text-lg"></i>
                  </button>
                  <button onClick={() => openEditModal(item.id)} className="flex-1 py-2.5 text-yellow-500 hover:bg-yellow-50 transition-colors" title="Edit">
                    <i className="fa fa-edit text-lg"></i>
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="flex-1 py-2.5 text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                    <i className="fa fa-trash text-lg"></i>
                  </button>
                </div>

                {/* List Barang (Data Pembelian) */}
                <div className="p-4 space-y-3">
                  {item.pembelian_data.map((detail, dIdx) => (
                    <div key={dIdx} className="bg-gray-50 rounded-lg p-3 border border-gray-200/60 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-gray-700 text-sm">{detail.barang.nama}</p>
                          <span className="inline-block mt-1 text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 uppercase font-semibold">
                            {detail.barang.tipe}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                          detail.pembayaran === 'cash' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {detail.pembayaran}
                        </span>
                      </div>
                      
                      {/* Grid Tonase */}
                      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                        <div className="bg-white rounded border border-gray-100 py-1.5 shadow-sm">
                          <p className="text-[9px] text-gray-400 uppercase font-bold">Kotor</p>
                          <p className="font-semibold text-gray-700 text-xs">{detail.pembelian_kotor}</p>
                        </div>
                        <div className="bg-white rounded border border-gray-100 py-1.5 shadow-sm">
                          <p className="text-[9px] text-gray-400 uppercase font-bold">Potongan</p>
                          <p className="font-semibold text-red-500 text-xs">{detail.pembelian_potongan}</p>
                        </div>
                        <div className="bg-white rounded border border-gray-100 py-1.5 shadow-sm">
                          <p className="text-[9px] text-gray-400 uppercase font-bold">Bersih</p>
                          <p className="font-semibold text-green-600 text-xs">{detail.pembelian_bersih}</p>
                        </div>
                      </div>

                      {/* Harga & Subtotal */}
                      <div className="flex justify-between items-center text-xs border-t border-gray-200/60 pt-2.5 mt-1">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase">Harga / Kg</span>
                          <span className="font-semibold text-gray-600">{RupiahFormat(detail.pembelian_harga)}</span>
                        </div>
                        <div className="text-right">
                           <span className="text-gray-400 block text-[10px] uppercase">Subtotal</span>
                           <span className="font-bold text-gray-800">{RupiahFormat(detail.pembelian_total)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Card (Total Keseluruhan) */}
                <div className="bg-teal-50/40 p-4 border-t border-teal-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Total Semua</span>
                  <span className="text-lg font-bold text-teal-700">{RupiahFormat(item.ttlPembelian)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-gray-100 text-sm">
              Data tidak ditemukan
            </div>
          )}
        </div>

        {/* ========================================= */}
        {/* VIEW DESKTOP: TABLE LAYOUT (Tampil > 768px) */}
        {/* ========================================= */}
        <div className={`hidden md:block overflow-x-auto rounded-lg border border-gray-200 ${blur ? "opacity-50" : "opacity-100"} transition-opacity`}>
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200" key="head-pembelian">
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-32 border-r border-gray-200">Aksi</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">No</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Suplier</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">Tanggal</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Barang</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">Tipe</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200" title="Tonase Kotor">T. Kotor</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">Pot.</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200" title="Tonase Bersih">T. Bersih</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200">Harga</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200">Subtotal</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">Status</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200">Total All</th>
                <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100" key="t-body-pembelian">
              {datas &&
                datas.map((item, index) => {
                  number++;
                  const totalPembelianData = item.pembelian_data.length;
                  
                  item.pembelian_data.forEach((pembelianDetail) => {
                    ttl_harga += parseInt(pembelianDetail.pembelian_harga, 10);
                    ttl_total += parseInt(pembelianDetail.pembelian_total, 10);
                    ttl_tonase_kotor += parseFloat(pembelianDetail.pembelian_kotor);
                    ttl_tonase_potongan += parseFloat(pembelianDetail.pembelian_potongan ?? 0);
                    ttl_tonase_bersih += parseFloat(pembelianDetail.pembelian_bersih);
                  });
                  
                  let firstPembelianDataOfSupplier = true;
                  
                  return (
                    <React.Fragment key={item.id}>
                      {item.pembelian_data.map((pembelianDetail, dataIndex) => {
                        const isFirstDetailOfSupplier = firstPembelianDataOfSupplier;
                        if (firstPembelianDataOfSupplier) {
                          firstPembelianDataOfSupplier = false;
                        }
                        
                        return (
                          <tr
                            key={"data" + item.id + dataIndex}
                            className="hover:bg-blue-50/30 transition-colors"
                          >
                            {isFirstDetailOfSupplier && (
                              <>
                                <td
                                  className="align-middle border-r border-b border-gray-200 p-2"
                                  rowSpan={totalPembelianData}
                                >
                                  <div className="flex flex-wrap justify-center gap-1">
                                    <button onClick={() => downloadImage(item.id)} className="w-7 h-7 flex items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Download Image">
                                      <i className="fa fa-image"></i>
                                    </button>
                                    <button onClick={() => viewModalCetak(item.id)} className="w-7 h-7 flex items-center justify-center rounded bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Preview/Cetak">
                                      <i className="fa fa-download text-sm"></i>
                                    </button>
                                    <button onClick={() => openEditModal(item.id)} className="w-7 h-7 flex items-center justify-center rounded bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors" title="Edit">
                                      <i className="fa fa-edit"></i>
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Delete">
                                      <i className="fa fa-trash"></i>
                                    </button>
                                  </div>
                                </td>
                                <td
                                  className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium"
                                  rowSpan={totalPembelianData}
                                >
                                  {number}
                                </td>
                                <td
                                  className="align-middle border-r border-b border-gray-200 py-2 px-3 text-sm text-gray-800 font-bold uppercase"
                                  rowSpan={totalPembelianData}
                                >
                                  {item.suplier_nama}
                                </td>
                                <td
                                  className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600"
                                  rowSpan={totalPembelianData}
                                >
                                  {FormatTanggal(item.pembelian_tgl)}
                                </td>
                              </>
                            )}
                            <td className="border-r border-gray-100 py-2 px-3 text-sm text-gray-700">
                              {pembelianDetail.barang.nama}
                            </td>
                            <td className="border-r border-gray-100 text-center py-2 px-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wider">
                                {pembelianDetail.barang.tipe}
                              </span>
                            </td>
                            <td className="border-r border-gray-100 text-center py-2 px-3 text-sm text-gray-600">
                              {pembelianDetail.pembelian_kotor}
                            </td>
                            <td className="border-r border-gray-100 text-center py-2 px-3 text-sm text-red-500 font-medium">
                              {pembelianDetail.pembelian_potongan}
                            </td>
                            <td className="border-r border-gray-100 text-center py-2 px-3 text-sm text-green-600 font-bold">
                              {pembelianDetail.pembelian_bersih}
                            </td>
                            <td className="border-r border-gray-100 text-right py-2 px-3 text-sm text-gray-700">
                              {RupiahFormat(pembelianDetail.pembelian_harga)}
                            </td>
                            <td className="border-r border-gray-100 text-right py-2 px-3 text-sm text-gray-700 font-semibold">
                              {RupiahFormat(pembelianDetail.pembelian_total)}
                            </td>
                            <td className="border-r border-gray-100 text-center py-2 px-3">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                pembelianDetail.pembayaran === "cash"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-red-100 text-red-700 border-red-200"
                              }`}>
                                {pembelianDetail.pembayaran}
                              </span>
                            </td>
                            {isFirstDetailOfSupplier && (
                              <>
                                <td
                                  className="align-middle text-right border-r border-b border-gray-200 py-2 px-3 text-sm text-gray-800 font-bold bg-gray-50/30"
                                  rowSpan={totalPembelianData}
                                >
                                  {RupiahFormat(item.ttlPembelian)}
                                </td>
                                <td
                                  className="align-middle text-center border-b border-gray-200 bg-gray-50/30"
                                  rowSpan={totalPembelianData}
                                >
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    <input
                                      type="checkbox"
                                      className="w-4 h-4 text-teal-600 bg-white border-gray-300 rounded focus:ring-teal-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                      name="suplier_nota_st"
                                      onChange={(event) => handleCheckboxChange(item.id, index)}
                                      checked={item.suplier_nota_st === "yes"}
                                      disabled={item.suplier_nota_st === "yes"}
                                    />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                      {item.suplier_nota_st === "yes" ? "Done" : "Draft"}
                                    </span>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              
              <tr key="jumlah" className="bg-gray-100/80 border-t-2 border-gray-300">
                <td colSpan="6" className="text-right py-3 px-4 text-sm font-bold text-gray-700 tracking-wider border-r border-gray-300">
                  TOTAL KESELURUHAN
                </td>
                <td className="text-center py-3 px-3 text-sm font-bold text-gray-800 border-r border-gray-200">
                  {Math.round(ttl_tonase_kotor * 100) / 100}
                </td>
                <td className="text-center py-3 px-3 text-sm font-bold text-red-600 border-r border-gray-200">
                  {Math.round(ttl_tonase_potongan * 100) / 100}
                </td>
                <td className="text-center py-3 px-3 text-sm font-bold text-green-700 border-r border-gray-200">
                  {Math.round(ttl_tonase_bersih * 100) / 100}
                </td>
                <td className="border-r border-gray-200"></td>
                <td className="text-right py-3 px-3 text-sm font-bold text-gray-800 border-r border-gray-200">
                  {RupiahFormat(ttl_total)}
                </td>
                <td className="border-r border-gray-200"></td>
                <td className="border-r border-gray-200"></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <ToastContainer position="bottom-right" />
      
      {isModalEditOpen ? (
        <ModalEditPembelian isOpen={isModalEditOpen} onClose={closeEditModal} id={edit_id} />
      ) : (
        <ModalAddPembelian isOpen={isModalOpen} onClose={closeModal} />
      )}
      
      {isModalCetak && (
        <ModalPreview isOpen={true} onClose={() => setIsModalCetak(!isModalCetak)} id={edit_id} />
      )}
    </div>
  );
}

export default Pembelian;