import React, { useState, useEffect, useRef } from "react";
import ModalAddPengiriman from "../components/ModalAddPengiriman";
import ModalEditPengiriman from "../components/ModalEditPengiriman";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import RupiahFormat from "../utilities/RupiahFormat";
import FormatTanggal from "../utilities/FormatTanggal";
import ModalPreviewPembelian from "../components/ModalPreviewPembelian";
import api from "../utilities/axiosInterceptor";

function Pengiriman() {
  // TOKEN
  const token = localStorage.getItem("token");
  
  // lastDate
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
  const [data_merek, setdata_merek] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(data_merek);
    }, 750); // Jeda 1 detik

    return () => {
      clearTimeout(handler);
    };
  }, [data_merek]);
  
  const handleInputChange = (event) => {
    const val = event.target.value;
    const name = event.target.name;
    if (name === "dateFrom") setDateFrom(val);
    if (name === "dateTo") setDateTo(val);
    if (name === "data_merek") setdata_merek(val);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [edit_id, setEdit_id] = useState(null);
  const [valueSt, setValueSt] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const openEditModal = (pengiriman_id) => {
    setIsModalEditOpen(true);
    setEdit_id(pengiriman_id);
  };
  const closeEditModal = () => setIsModalEditOpen(false);
  
  //define state
  const [datas, setDatas] = useState([]);
  const [blur, setBlur] = useState(true);
  let [number, setNumber] = useState(1);
  const [endPoint, setEndPoint] = useState("/index-Pengiriman");
  const [dataKaryawan, setDataKaryawan] = useState([]);
  const [stModalBeban, setStModalBeban] = useState(false);
  
  //useEffect hook
  const fectData = async () => {
    let params = {
      dateFrom: dateFrom,
      dateTo: dateTo,
      params: debouncedSearch,
    };
    setBlur(true);
    const response = await api.post(endPoint, params, {
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
  };

  useEffect(() => {
    fectData();
    const fectDataKaryawan = async () => {
      const data_karyawan = await api.get("/get-karyawan", {
        headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const data = await data_karyawan.data.dataKaryawan;
      setDataKaryawan(data);
    };
    setValueSt(false);
    fectDataKaryawan();
  }, [
    isModalOpen,
    endPoint,
    dateFrom,
    dateTo,
    isModalEditOpen,
    stModalBeban,
    valueSt,
    debouncedSearch,
  ]);

  const changeAfterAddData = (suplierData) => {};

  const changeEndPoint = (url, label) => {
    setEndPoint(url);
    let num = parseInt(label) * 5 - 5 + 1;
    setNumber(num);
  };

  const grandTotal = datas.reduce((total, item) => {
    const subTotal = item.listPengiriman.reduce(
      (subTotal, subItem) => subTotal + Number(subItem.data_total),
      0,
    );
    return total + subTotal;
  }, 0);

  const inputRef = useRef(null);

  const handleInput = (key, event) => {
    datas[key]["jumlah"] = event.target.value;
    setDatas(datas);
  };

  const handleSimpan = (pengiriman_id, kunci) => {
    alert(pengiriman_id);
    const filteredData = datas.filter((item) => item.pengiriman_id === pengiriman_id);
  };

  const [inputBebanKaryawan, setInputBebanKaryawan] = useState([
    { karyawan_id: "", beban_value: "" },
  ]);

  const handleAddKaryawan = () => {
    setInputBebanKaryawan([...inputBebanKaryawan, { karyawan_id: "", beban_value: "" }]);
  };
  const [bebanKardus, setInputBebanKardus] = useState("0");
  
  const [inputBebanLain, setInputBebanLain] = useState([
    { beban_nama: "", beban_value: "" },
  ]);

  const handleAddLain = () => {
    setInputBebanLain([...inputBebanLain, { beban_nama: "", beban_value: "" }]);
  };

  const [pengiriman_id, setSPengiriman_id] = useState(null);
  const [pengiriman_tgl, setSPengiriman_tgl] = useState(null);
  
  const handleModalBeban = (pengiriman_id, pengiriman_tgl) => {
    setSPengiriman_id(pengiriman_id);
    setSPengiriman_tgl(pengiriman_tgl);
    setStModalBeban(!stModalBeban);
  };

  const [isFunctionComplete, setIsFunctionComplete] = useState(false);

  useEffect(() => {
    const fectData = async () => {
      let params = {
        pengiriman_tgl: pengiriman_tgl,
        pengiriman_id: pengiriman_id,
      };
      const response = await api.post("/detail-Pengiriman-Beban", params, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 200) {
        const dataBebanKaryawan = await response.data.dataBebanKaryawan;
        const dataBebanLain = await response.data.dataBebanLain;
        const dataBebanKardus = await response.data.bebanKardus;
        setInputBebanKaryawan(dataBebanKaryawan);
        setInputBebanLain(dataBebanLain);
        setInputBebanKardus(dataBebanKardus);
      }
    };
    fectData();
    setIsFunctionComplete(false);
  }, [stModalBeban, pengiriman_id, pengiriman_tgl, isFunctionComplete]);

  const handleRemoveField = (index) => {
    const values = [...inputBebanKaryawan];
    values.splice(index, 1);
    setInputBebanKaryawan(values);
  };

  const handleInputKaryawan = (index, event) => {
    const values = [...inputBebanKaryawan];
    values[index][event.target.name] = event.target.value;
    setInputBebanKaryawan(values);
  };

  const handleInputLain = (index, event) => {
    const values = [...inputBebanLain];
    values[index][event.target.name] = event.target.value;
    setInputBebanLain(values);
  };

  const handleRemoveFieldLain = (index) => {
    const values = [...inputBebanLain];
    values.splice(index, 1);
    setInputBebanLain(values);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const toastId = toast.loading("Sending data...");
    try {
      const data = {
        pengiriman_tgl: pengiriman_tgl,
        pengiriman_id: pengiriman_id,
      };
      let params = {
        formDataKaryawan: inputBebanKaryawan,
        formDataLain: inputBebanLain,
        pengirimanData: data,
      };
      const response = await api.post("/add-Pengiriman-Beban", params, {
        headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (response.status === 200) {
        toast.update(toastId, {
          render: "Data sent successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: "Error sending data!" + response.status,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Error sending data! " + error.message,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const handleDelete = async (pengiriman_id) => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus data ini?");
    if (isConfirmed) {
      const toastId = toast.loading("Sending data...");
      try {
        const params = { pengiriman_id: pengiriman_id };
        const response = await api.post("/delete-Pengiriman", params, {
          headers: {
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json",
            Accept: "application/json",
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
      setIsFunctionComplete(true);
    }
  };

  const downloadImage = async (pengiriman_id) => {
    const toastId = toast.loading("Sending data...");
    try {
      const response = await api.get(`/pengiriman-cetak-image/${pengiriman_id}`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", 
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Pengiriman.png"); 
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
  
  const [isModalCetak, setIsModalCetak] = useState(false);
  const viewModalCetak = (suplier_id) => {
    setIsModalCetak(!isModalCetak);
    setEdit_id(suplier_id);
  };
  
  let ttl_operational = 0;
  let ttl_data_total = 0;
  let local_number = 0; // Local counter for rendering

  return (
    <>
      <div className="p-1 md:p-3 xl:p-5 font-poppins">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 w-full h-full mx-auto">
          
          {/* Header & Title */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Data Pengiriman</h2>
              <p className="text-sm text-gray-500 mt-1">Kelola transaksi pengiriman dan operasional beban</p>
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
                  name="data_merek"
                  placeholder="Cari Pembeli, barang, supplier..."
                  className="w-full border border-gray-200 py-2 pl-9 pr-3 rounded-lg bg-white text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all text-gray-700"
                  value={data_merek}
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
                ttl_operational += item.totalBeban;
                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Header Card */}
                    <div className="bg-gray-50/80 p-4 border-b border-gray-100 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-gray-800 text-base uppercase leading-tight">{item.nama_pembeli}</h3>
                        <p className="text-xs text-gray-500 mt-1">{FormatTanggal(item.pengiriman_tgl)}</p>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 border border-gray-200 text-gray-600">
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {/* Tombol Aksi per Transaksi */}
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

                    {/* Uang Muka & Operasional */}
                    <div className="p-4 border-b border-gray-100 bg-white grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Uang Muka</span>
                        <span className="font-bold text-gray-700">{RupiahFormat(item.uang_muka)}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Atur Operasional</span>
                        <div className="flex justify-end items-center gap-2">
                          <button 
                            onClick={() => handleModalBeban(item.id, item.pengiriman_tgl)}
                            className="w-7 h-7 flex items-center justify-center bg-teal-50 text-teal-600 rounded-md hover:bg-teal-100"
                          >
                            <i className="fa fa-book text-sm"></i>
                          </button>
                          <span className="font-bold text-red-500">{RupiahFormat(item.totalBeban)}</span>
                        </div>
                      </div>
                    </div>

                    {/* List Barang */}
                    <div className="p-4 space-y-3 bg-white">
                      <span className="block text-xs font-bold text-gray-800 border-b border-gray-100 pb-2">Detail Pengiriman</span>
                      {item.listPengiriman && item.listPengiriman.map((listPem, key) => {
                        ttl_data_total += parseInt(listPem.data_total ?? 0, 10);
                        return (
                          <div key={listPem.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200/60 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-bold text-gray-700 text-sm">{listPem.barang?.nama}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">Suplier: {listPem.suplier?.suplier_nama}</p>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${
                                listPem.pembayaran_st === 'cash' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                              }`}>
                                {listPem.pembayaran_st}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs mt-3 pt-2 border-t border-gray-200/60">
                              <div>
                                <span className="text-gray-400 block text-[9px] uppercase">Tonase / Harga</span>
                                <span className="font-medium text-gray-600">{listPem.data_tonase} x {RupiahFormat(listPem.data_harga)}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-gray-400 block text-[9px] uppercase">Subtotal</span>
                                <span className="font-bold text-gray-800">{RupiahFormat(listPem.data_total)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-teal-800 uppercase">Total Operasional</span>
                  <span className="text-sm font-bold text-red-600">{RupiahFormat(ttl_operational)}</span>
                </div>
                <div className="flex justify-between border-t border-teal-200 pt-2 mt-2">
                  <span className="text-sm font-bold text-teal-900 uppercase">Grand Total</span>
                  <span className="text-lg font-bold text-teal-700">{RupiahFormat(ttl_data_total)}</span>
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
              {ttl_data_total = 0}
            </div>
            
            <table className="w-full text-left border-collapse min-w-[1300px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-28">Aksi</th>
                  <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-12">No</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-28">Tanggal</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-40">Nama Pembeli</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200 w-32">Uang Muka</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-24">Status</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200 w-36">Atur Ops</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-40">Barang</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-36">Supplier</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-24">Tonase</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200 w-32">Harga</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200 w-32">Total</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Pembayaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {datas.map((item, key) => {
                  ttl_operational += item.totalBeban;
                  local_number++;
                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-teal-50/20 transition-colors border-t-2 border-gray-100">
                        <td className="align-middle border-r border-b border-gray-200 p-2" rowSpan={item.listPengiriman.length || 1}>
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
                        <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium" rowSpan={item.listPengiriman.length || 1}>
                          {local_number}
                        </td>
                        <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600" rowSpan={item.listPengiriman.length || 1}>
                          {FormatTanggal(item.pengiriman_tgl)}
                        </td>
                        <td className="align-middle border-r border-b border-gray-200 py-2 px-3 text-sm text-gray-800 font-bold uppercase" rowSpan={item.listPengiriman.length || 1}>
                          {item.nama_pembeli}
                        </td>
                        <td className="align-middle text-right border-r border-b border-gray-200 py-2 px-3 text-sm text-gray-700" rowSpan={item.listPengiriman.length || 1}>
                          {RupiahFormat(item.uang_muka)}
                        </td>
                        <td className="align-middle text-center border-r border-b border-gray-200 py-2 px-2" rowSpan={item.listPengiriman.length || 1}>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wider">
                            {item.status}
                          </span>
                        </td>
                        <td className="align-middle text-right border-r border-b border-gray-200 py-2 px-3 bg-gray-50/30" rowSpan={item.listPengiriman.length || 1}>
                          <div className="flex justify-end items-center gap-2">
                            <button 
                              onClick={() => handleModalBeban(item.id, item.pengiriman_tgl)}
                              className="w-7 h-7 flex items-center justify-center bg-teal-50 text-teal-600 rounded hover:bg-teal-100 transition-colors border border-teal-100"
                              title="Atur Operational"
                            >
                              <i className="fa fa-book text-sm"></i>
                            </button>
                            <span className="text-sm font-bold text-red-500">{RupiahFormat(item.totalBeban)}</span>
                          </div>
                        </td>
                        
                        {/* Data pertama listPengiriman */}
                        <td className="border-r border-gray-100 py-2 px-3 text-sm text-gray-700 font-medium">
                          {item.listPengiriman[0] && item.listPengiriman[0].barang?.nama}
                        </td>
                        <td className="border-r border-gray-100 py-2 px-3 text-sm text-gray-600">
                          {item.listPengiriman[0] && item.listPengiriman[0].suplier?.suplier_nama}
                        </td>
                        <td className="border-r border-gray-100 text-center py-2 px-3 text-sm text-gray-700">
                          {item.listPengiriman[0] && item.listPengiriman[0]["data_tonase"]}
                        </td>
                        <td className="border-r border-gray-100 text-right py-2 px-3 text-sm text-gray-700">
                          {RupiahFormat(item.listPengiriman[0] && item.listPengiriman[0]["data_harga"])}
                        </td>
                        <td className="border-r border-gray-100 text-right py-2 px-3 text-sm font-semibold text-gray-800">
                          {RupiahFormat(item.listPengiriman[0] && item.listPengiriman[0]["data_total"])}
                        </td>
                        <td className="text-center py-2 px-3">
                          {item.listPengiriman[0] && (
                            <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              item.listPengiriman[0]["pembayaran_st"] === "cash"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }`}>
                              {item.listPengiriman[0]["pembayaran_st"]}
                            </span>
                          )}
                        </td>
                      </tr>
                      
                      {/* Data sisa listPengiriman (jika ada) */}
                      {item.listPengiriman && item.listPengiriman.map((listPem, keyIndex) => {
                        ttl_data_total += parseInt(listPem.data_total ?? 0, 10);
                        return (
                          <React.Fragment key={listPem.id}>
                            {JSON.stringify(keyIndex) === "0" ? null : (
                              <tr className="hover:bg-teal-50/20 transition-colors">
                                <td className="border-r border-gray-100 py-2 px-3 text-sm text-gray-700 font-medium">
                                  {listPem.barang?.nama}
                                </td>
                                <td className="border-r border-gray-100 py-2 px-3 text-sm text-gray-600">
                                  {listPem.suplier?.suplier_nama}
                                </td>
                                <td className="border-r border-gray-100 text-center py-2 px-3 text-sm text-gray-700">
                                  {listPem.data_tonase}
                                </td>
                                <td className="border-r border-gray-100 text-right py-2 px-3 text-sm text-gray-700">
                                  {RupiahFormat(listPem.data_harga)}
                                </td>
                                <td className="border-r border-gray-100 text-right py-2 px-3 text-sm font-semibold text-gray-800">
                                  {RupiahFormat(listPem.data_total)}
                                </td>
                                <td className="text-center py-2 px-3">
                                  <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                    listPem.pembayaran_st === "cash"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : "bg-red-100 text-red-700 border-red-200"
                                  }`}>
                                    {listPem.pembayaran_st}
                                  </span>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
                
                {/* Total Row */}
                <tr className="bg-gray-100/80 border-t-2 border-gray-300">
                  <td colSpan="6" className="text-right py-3 px-4 text-sm font-bold text-gray-700 tracking-wider border-r border-gray-300">
                    TOTAL OPERATIONAL
                  </td>
                  <td className="text-right py-3 px-3 text-sm font-bold text-red-600 border-r border-gray-200">
                    {RupiahFormat(ttl_operational)}
                  </td>
                  <td colSpan="4" className="text-right py-3 px-4 text-sm font-bold text-gray-700 tracking-wider border-r border-gray-200">
                    GRAND TOTAL
                  </td>
                  <td colSpan="2" className="text-right py-3 px-4 text-sm font-bold text-teal-700">
                    {RupiahFormat(ttl_data_total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <ToastContainer position="bottom-right" />
        
        {isModalEditOpen ? (
          <ModalEditPengiriman isOpen={isModalEditOpen} onClose={closeEditModal} pengiriman_id={edit_id} />
        ) : (
          <ModalAddPengiriman isOpen={isModalOpen} onClose={closeModal} listData={changeAfterAddData} />
        )}
        
        {isModalCetak && (
          <ModalPreviewPembelian isOpen={true} onClose={() => setIsModalCetak(!isModalCetak)} pengiriman_id={edit_id} />
        )}
      </div>

      {/* ========================================= */}
      {/* MODAL ATUR OPERASIONAL (Beban)            */}
      {/* ========================================= */}
      {stModalBeban && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6 font-poppins">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => handleModalBeban()}></div>
          
          <div className="bg-white w-full max-w-2xl h-full max-h-[85vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                  <i className="fa fa-money-bill-wave text-lg"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 leading-tight">Atur Operasional</h2>
                  <p className="text-xs text-gray-500">Kelola beban dan pengeluaran pengiriman</p>
                </div>
              </div>
              <button onClick={() => handleModalBeban()} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <i className="fa fa-times text-lg"></i>
              </button>
            </div>

            {/* Body Modal (Form) */}
            <div className="flex-1 overflow-y-auto p-5 bg-gray-50/30">
              <form onSubmit={handleSubmit} id="form-operasional">
                <input type="hidden" value={pengiriman_id} />
                <input type="hidden" value={pengiriman_tgl} />
                
                {/* 1. Kardus */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-5">
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-2 border-b border-gray-100 pb-2">1. Operasional Kardus</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-50 text-orange-500 rounded flex justify-center items-center">
                      <i className="fa fa-box"></i>
                    </div>
                    <p className="font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded border border-red-100">
                      {RupiahFormat(bebanKardus)}
                    </p>
                  </div>
                </div>

                {/* 2. Karyawan */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-5">
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 border-b border-gray-100 pb-2">2. Operasional Karyawan</h3>
                  
                  <div className="space-y-3 mb-3">
                    {inputBebanKaryawan.map((field, index) => (
                      <div className="flex flex-col sm:flex-row gap-2" key={index}>
                        <div className="flex-1">
                          <select
                            required
                            name="karyawan_id"
                            className="w-full border border-gray-200 py-2 px-3 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all cursor-pointer"
                            value={field.karyawan_id}
                            onChange={(event) => handleInputKaryawan(index, event)}
                          >
                            <option value="">-- Pilih Karyawan --</option>
                            {dataKaryawan.map((option) => (
                              <option key={option.id} value={option.id}>{option.karyawan_nama}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <input
                            required
                            name="beban_value"
                            type="number"
                            className="w-full border border-gray-200 py-2 px-3 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                            placeholder="Nilai Operasional"
                            value={field.beban_value}
                            onChange={(event) => handleInputKaryawan(index, event)}
                          />
                        </div>
                        <button
                          type="button"
                          className="w-full sm:w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          onClick={() => handleRemoveField(index)}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors shadow-sm"
                    onClick={() => handleAddKaryawan()}
                  >
                    <i className="fa fa-plus text-xs"></i> Tambah Karyawan
                  </button>
                </div>

                {/* 3. Lainnya */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-5">
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 border-b border-gray-100 pb-2">3. Operasional Lainnya</h3>
                  
                  <div className="space-y-3 mb-3">
                    {inputBebanLain.map((field, index) => (
                      <div className="flex flex-col sm:flex-row gap-2" key={index}>
                        <div className="flex-1">
                          <input
                            required
                            name="beban_nama"
                            type="text"
                            className="w-full border border-gray-200 py-2 px-3 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                            placeholder="Nama Beban (Contoh: Bensin)"
                            value={field.beban_nama}
                            onChange={(event) => handleInputLain(index, event)}
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            required
                            name="beban_value"
                            type="number"
                            className="w-full border border-gray-200 py-2 px-3 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                            placeholder="Nilai Operasional"
                            value={field.beban_value}
                            onChange={(event) => handleInputLain(index, event)}
                          />
                        </div>
                        <button
                          type="button"
                          className="w-full sm:w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          onClick={() => handleRemoveFieldLain(index)}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors shadow-sm"
                    onClick={() => handleAddLain()}
                  >
                    <i className="fa fa-plus text-xs"></i> Tambah Lainnya
                  </button>
                </div>
              </form>
            </div>

            {/* Footer Modal */}
            <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
              <button
                type="button"
                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                onClick={() => handleModalBeban()}
              >
                Tutup
              </button>
              <button
                type="submit"
                form="form-operasional"
                className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <i className="fa fa-save"></i> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Pengiriman;