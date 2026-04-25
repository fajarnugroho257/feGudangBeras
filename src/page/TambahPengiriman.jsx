import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import RupiahFormat from "../utilities/RupiahFormat";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import api from "../utilities/axiosInterceptor";
import FormatTanggal from "../utilities/FormatTanggal";

function TambahPengiriman() {
  // TOKEN
  const token = localStorage.getItem("token");
  //
  const [pengiriman_tgl, setPengiriman_tgl] = useState(new Date().toISOString().slice(0, 10));
  const [nama_pembeli, setNama_pembeli] = useState("");
  const [uang_muka, setUang_muka] = useState("");
  const [status, setStatus] = useState("yes");
  const [boxHarga, setBoxHarga] = useState(null);
  const [boxJumlah, setBoxJumlah] = useState(0);
  const [barangOptionsCache, setBarangOptionsCache] = useState({});
  const [supplierOptionsCache, setSupplierOptionsCache] = useState([]);
  const [stockDataByIndex, setStockDataByIndex] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePengiriman_tgl = (event) => setPengiriman_tgl(event.target.value);
  const handleNama_pembeli = (event) => setNama_pembeli(event.target.value);
  const handleUang_muka = (event) => setUang_muka(event.target.value);
  const handleStatus = (event) => setStatus(event.target.value);

  const [inputFields, setInputFields] = useState([
    {
      barang_tipe: "beras",
      barang_id: null,
      selectedBarang: null,
      supplier_id: null,
      selectedSupplier: null,
      current_stock: 0,
      data_tonase: "",
      data_harga: "",
      data_total: "",
      pembayaran_st: "cash",
    },
  ]);

  useEffect(() => {
    const fectData = async () => {
      try {
        const response = await api.get("/detail-Kardus/1", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        const harga = await response.data.data?.harga;
        const jumlah = await response.data.data?.jumlah;
        
        if (response.status === 200) {
          setInputFields((prevFields) =>
            prevFields.map((field) => ({
              ...field,
              data_harga: field.data_harga || harga,
            })),
          );
        }
        setBoxHarga(harga);
        setBoxJumlah(jumlah);
      } catch (error) {
        console.error("Error fetching kardus data:", error);
      }
    };
    fectData();
  }, [token]);

  const fetchBarangByType = useCallback(
    async (tipe) => {
      if (barangOptionsCache[tipe]) return;
      try {
        const response = await api.get('/get-barang', {
          params: { tipe },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200 && Array.isArray(response.data.dataBarang)) {
          const options = response.data.dataBarang.map((item) => ({
            value: item.id,
            label: item.nama,
          }));
          setBarangOptionsCache((prev) => ({
            ...prev,
            [tipe]: options,
          }));
        }
      } catch (error) {
        console.error(`Failed to fetch barang for type ${tipe}:`, error);
      }
    },
    [barangOptionsCache, token],
  );

  const fetchSuppliers = useCallback(async () => {
    if (supplierOptionsCache.length > 0) return;
    try {
      const response = await api.get('/get-suplier', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200 && Array.isArray(response.data.dataSuplier)) {
        const options = response.data.dataSuplier.map((item) => ({
          value: item.id,
          label: item.nama,
        }));
        setSupplierOptionsCache(options);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  }, [supplierOptionsCache, token]);

  const fetchStock = useCallback(
    async (barangId) => {
      try {
        const response = await api.get('/get-stock', {
          params: { barang_id: barangId },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200 && Array.isArray(response.data.dataStock)) {
          return response.data.dataStock;
        }
        return [];
      } catch (error) {
        console.error(`Failed to fetch stock for barang ${barangId}:`, error);
        return [];
      }
    },
    [token],
  );

  useEffect(() => {
    fetchBarangByType('beras');
    fetchBarangByType('gabah');
    fetchSuppliers();
  }, [fetchBarangByType, fetchSuppliers]);

  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      {
        barang_tipe: "beras",
        barang_id: null,
        selectedBarang: null,
        supplier_id: null,
        selectedSupplier: null,
        current_stock: 0,
        data_tonase: "",
        data_harga: boxHarga || "",
        data_total: "",
        pembayaran_st: "cash",
      },
    ]);
  };

  const handleRemoveField = (index) => {
    const values = [...inputFields];
    values.splice(index, 1);
    setInputFields(values);
  };

  const handleInputChange = (index, event) => {
    const values = [...inputFields];

    if (event.target.name === "barang_tipe") {
      values[index].barang_tipe = event.target.value;
      values[index].selectedBarang = null;
      values[index].barang_id = null;
      fetchBarangByType(event.target.value);
    } else if (event.target.name === "pembayaran_st") {
      values[index].pembayaran_st = event.target.value;
    } else {
      values[index][event.target.name] = event.target.value;
    }

    if (event.target.name === "data_tonase" || event.target.name === "data_harga") {
      const tonase = Number(values[index].data_tonase || 0);
      const harga = Number(values[index].data_harga || 0);
      values[index].data_total = tonase * harga;
    }

    setInputFields(values);
  };

  const handleSelectBarang = (index, selected) => {
    const values = [...inputFields];
    values[index].selectedBarang = selected;
    values[index].barang_id = selected ? selected.value : null;
    values[index].current_stock = 0;
    values[index].selectedSupplier = null;
    values[index].supplier_id = null;
    setInputFields(values);

    if (selected && selected.value) {
      fetchStock(selected.value).then((stockData) => {
        const supplierOptions = stockData.map((item) => ({
          value: item.suplier_id,
          label: item.suplier.suplier_nama + " (Stok: " + item.stok + ")",
        }));
        setStockDataByIndex((prev) => ({
          ...prev,
          [index]: { stockData, supplierOptions },
        }));
      });
    }
  };

  const handleSelectSupplier = (index, selected) => {
    const values = [...inputFields];
    values[index].selectedSupplier = selected;
    values[index].supplier_id = selected ? selected.value : null;

    if (selected && stockDataByIndex[index]) {
      const stockEntry = stockDataByIndex[index].stockData.find(
        (item) => item.suplier_id === selected.value
      );
      if (stockEntry) {
        values[index].current_stock = stockEntry.stok;
      }
    }
    setInputFields(values);
  };

  const navigate = useNavigate();
  const handleTab = (event) => {
    navigate(`/${event}`);
  };

  const handleSubmit = async (event) => {
    const btnValue = event.nativeEvent.submitter.value; 
    event.preventDefault();

    if (isSubmitting) return; 
    setIsSubmitting(true); 

    const toastId = toast.loading("Sending data...");
    try {
      const data = {
        pengiriman_tgl: pengiriman_tgl,
        nama_pembeli: nama_pembeli || null,
        uang_muka: uang_muka || null,
        status: status || null,
      };
      const sanitizedFields = inputFields.map((item) => ({
        barang_id: item.barang_id || null,
        data_tonase: item.data_tonase,
        data_harga: item.data_harga,
        data_total: item.data_total,
        pembayaran_st: item.pembayaran_st || null,
        supplier_id: item.supplier_id || null,
      }));
      let params = {
        formData: sanitizedFields,
        pengirimanData: data,
        type: btnValue,
      };
      let response = "";
      if (btnValue === "simcetak") {
        response = await api.post(`/add-Pengiriman`, params, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", 
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "Pengiriman.png"); 
        document.body.appendChild(link);
        link.click(); 
        document.body.removeChild(link); 
      } else {
        response = await api.post("/add-Pengiriman", params, {
          headers: {
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
      }
      
      if (response.status === 200) {
        setPengiriman_tgl(new Date().toISOString().slice(0, 10));
        setNama_pembeli("");
        setUang_muka("");
        setStatus("yes");
        setInputFields([
          {
            barang_tipe: "beras",
            barang_id: null,
            selectedBarang: null,
            supplier_id: null,
            selectedSupplier: null,
            current_stock: 0,
            data_tonase: "",
            data_harga: boxHarga || "",
            data_total: "",
            pembayaran_st: "cash",
          },
        ]);
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
      console.error("Error posting data:", error);
    } finally {
      setIsSubmitting(false); 
    }
  };

  const resTtlPengiriman = inputFields.reduce(
    (sum, val) => sum + Number(val.data_total || 0),
    0,
  );

  return (
    <div className="p-1 md:p-3 xl:p-5 font-poppins">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 w-full h-full mx-auto flex flex-col">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-100 pb-4">
          <button
            className="px-4 py-2 text-gray-500 hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors"
            onClick={() => handleTab("tambah-pembelian")}
          >
            Pembelian
          </button>
          <button className="px-4 py-2 bg-teal-50 text-teal-700 font-bold rounded-lg text-sm border border-teal-200 transition-colors">
            Pengiriman
          </button>
          <button
            className="px-4 py-2 text-gray-500 hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors"
            onClick={() => handleTab("tambah-karyawan")}
          >
            Karyawan
          </button>
          {/* <button
            className="px-4 py-2 text-gray-500 hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors"
            onClick={() => handleTab("tambah-kardus")}
          >
            Kardus
          </button> */}
        </div>

        {/* Main Content Form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="h-fit">
            
            {/* Header Form (Detail Pengiriman) */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Tanggal Pengiriman */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Tanggal Pengiriman
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                    name="pengiriman_tgl"
                    value={pengiriman_tgl}
                    onChange={handlePengiriman_tgl}
                    required
                  />
                </div>

                {/* Uang Muka */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Uang Muka
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Rp</span>
                    <input
                      type="number"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                      placeholder="0"
                      name="uang_muka"
                      value={uang_muka}
                      onChange={handleUang_muka}
                    />
                  </div>
                </div>

                {/* Nama Pembeli */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Nama Pembeli
                  </label>
                  <div className="relative">
                    <i className="fa fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                      placeholder="Masukkan nama pembeli"
                      name="nama_pembeli"
                      value={nama_pembeli}
                      onChange={handleNama_pembeli}
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Status Publish
                  </label>
                  <select
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all cursor-pointer"
                    name="status"
                    value={status}
                    onChange={handleStatus}
                  >
                    <option value="yes">Yes (Publish)</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

              </div>
            </div>

            {/* ========================================= */}
            {/* VIEW MOBILE: CARD LAYOUT (Tampil < 768px)  */}
            {/* ========================================= */}
            <div className="md:hidden space-y-4 mb-6">
              <label className="block text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">
                Daftar Barang Pengiriman ({inputFields.length} Item)
              </label>
              
              {inputFields.map((field, index) => {
                let rowNumber = index + 1;
                return (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative flex flex-col gap-3">
                    
                    {/* Header Card & Delete Button */}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="font-bold text-teal-700 text-sm">Barang #{rowNumber}</span>
                      {index > 0 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveField(index)} 
                          className="w-7 h-7 flex justify-center items-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <i className="fa fa-trash text-xs"></i>
                        </button>
                      )}
                    </div>

                    {/* Tipe & Pilih Barang */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Tipe</label>
                          <select
                            className="w-full py-2 px-2 bg-white border border-gray-200 rounded-md text-xs text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none"
                            name="barang_tipe"
                            value={field.barang_tipe}
                            onChange={(event) => handleInputChange(index, event)}
                          >
                            <option value="beras">Beras</option>
                            <option value="katul">Katul</option>
                            <option value="sekam">Sekam</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Pilih Barang</label>
                          <Select
                            value={field.selectedBarang}
                            onChange={(selected) => handleSelectBarang(index, selected)}
                            options={barangOptionsCache[field.barang_tipe] || []}
                            placeholder="Cari..."
                            isClearable
                            menuPortalTarget={document.body}
                            styles={{
                              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                              control: (base, state) => ({
                                ...base,
                                minHeight: '34px',
                                fontSize: '12px',
                                borderColor: state.isFocused ? '#2dd4bf' : '#e5e7eb',
                                borderRadius: '0.375rem',
                              })
                            }}
                          />
                        </div>
                      </div>

                      {/* Pilih Supplier */}
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Pilih Supplier</label>
                        <Select
                          value={field.selectedSupplier}
                          onChange={(selected) => handleSelectSupplier(index, selected)}
                          options={stockDataByIndex[index]?.supplierOptions || []}
                          placeholder="Pilih Supplier..."
                          isClearable
                          menuPortalTarget={document.body}
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            control: (base, state) => ({
                              ...base,
                              minHeight: '34px',
                              fontSize: '12px',
                              borderColor: state.isFocused ? '#2dd4bf' : '#e5e7eb',
                              borderRadius: '0.375rem',
                            })
                          }}
                        />
                      </div>
                    </div>

                    {/* Stock, Tonase, Harga */}
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block text-center">Stok Sisa</label>
                        <input
                          type="text"
                          className="w-full py-1.5 px-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-center text-gray-700 outline-none"
                          name="current_stock"
                          value={field.current_stock}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block text-center">Tonase</label>
                        <input
                          type="number"
                          required
                          name="data_tonase"
                          className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-center text-teal-700 font-bold outline-none focus:border-teal-400"
                          value={field.data_tonase}
                          onChange={(event) => handleInputChange(index, event)}
                          onFocus={(e) => e.target.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block text-center">Harga</label>
                        <input
                          type="number"
                          required
                          name="data_harga"
                          className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-center text-gray-700 outline-none focus:border-teal-400"
                          value={field.data_harga}
                          onChange={(event) => handleInputChange(index, event)}
                          onFocus={(e) => e.target.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                        />
                      </div>
                    </div>

                    {/* Pembayaran & Subtotal */}
                    <div className="grid grid-cols-2 gap-3 mt-1 pt-3 border-t border-gray-100">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Pembayaran</label>
                        <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                          <label className={`flex-1 flex items-center justify-center cursor-pointer py-1.5 rounded-md transition-all ${field.pembayaran_st === "cash" ? "bg-teal-600 text-white shadow-sm" : "text-gray-500"}`}>
                            <input
                              type="radio"
                              className="hidden"
                              name={`pembayaran_st-${index}`}
                              value="cash"
                              onChange={() => handleInputChange(index, { target: { name: 'pembayaran_st', value: 'cash' } })}
                              checked={field.pembayaran_st === "cash"}
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Cash</span>
                          </label>
                          <label className={`flex-1 flex items-center justify-center cursor-pointer py-1.5 rounded-md transition-all ${field.pembayaran_st === "hutang" ? "bg-red-500 text-white shadow-sm" : "text-gray-500"}`}>
                            <input
                              type="radio"
                              className="hidden"
                              name={`pembayaran_st-${index}`}
                              value="hutang"
                              onChange={() => handleInputChange(index, { target: { name: 'pembayaran_st', value: 'hutang' } })}
                              checked={field.pembayaran_st === "hutang"}
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Hutang</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Subtotal</label>
                        <input
                          type="text"
                          className="w-full py-2 px-3 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-800 font-bold text-right outline-none"
                          value={RupiahFormat(field.data_total || 0)}
                          readOnly
                        />
                      </div>
                    </div>

                  </div>
                );
              })}

              {/* Total Mobile Bawah */}
              <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-4 shadow-sm flex justify-between items-center">
                <span className="text-sm font-bold text-teal-900 uppercase">Grand Total</span>
                <span className="text-lg font-bold text-teal-700">{RupiahFormat(resTtlPengiriman)}</span>
              </div>
            </div>

            {/* ========================================= */}
            {/* VIEW DESKTOP: TABLE LAYOUT (Tampil > 768px) */}
            {/* ========================================= */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-12">No</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-28">Tipe</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56">Barang</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56">Supplier</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-24">Stock</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-28">Tonase</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200 w-32">Harga (Rp)</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200 w-32">Total</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-36">Pembayaran</th>
                      <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center w-14">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inputFields.map((field, index) => {
                      const rowNumber = index + 1;
                      return (
                        <tr key={index} className="hover:bg-teal-50/20 transition-colors">
                          <td className="py-2 px-2 text-center text-sm font-medium text-gray-500 border-r border-gray-100">{rowNumber}</td>
                          
                          <td className="py-2 px-3 border-r border-gray-100">
                            <select
                              className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all cursor-pointer"
                              name="barang_tipe"
                              value={field.barang_tipe}
                              onChange={(event) => handleInputChange(index, event)}
                            >
                              <option value="beras">Beras</option>
                              <option value="katul">Katul</option>
                              <option value="sekam">Sekam</option>
                            </select>
                          </td>
                          
                          <td className="py-2 px-3 border-r border-gray-100">
                            <Select
                              value={field.selectedBarang}
                              onChange={(selected) => handleSelectBarang(index, selected)}
                              options={barangOptionsCache[field.barang_tipe] || []}
                              placeholder="Pilih Barang..."
                              isClearable
                              menuPortalTarget={document.body}
                              styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                control: (base, state) => ({
                                  ...base,
                                  minHeight: '34px',
                                  fontSize: '13px',
                                  borderColor: state.isFocused ? '#2dd4bf' : '#e5e7eb',
                                  boxShadow: state.isFocused ? '0 0 0 1px #2dd4bf' : 'none',
                                  borderRadius: '0.375rem',
                                  '&:hover': { borderColor: '#2dd4bf' }
                                })
                              }}
                            />
                          </td>

                          <td className="py-2 px-3 border-r border-gray-100">
                            <Select
                              value={field.selectedSupplier}
                              onChange={(selected) => handleSelectSupplier(index, selected)}
                              options={stockDataByIndex[index]?.supplierOptions || []}
                              placeholder="Pilih Supplier..."
                              isClearable
                              menuPortalTarget={document.body}
                              styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                control: (base, state) => ({
                                  ...base,
                                  minHeight: '34px',
                                  fontSize: '13px',
                                  borderColor: state.isFocused ? '#2dd4bf' : '#e5e7eb',
                                  boxShadow: state.isFocused ? '0 0 0 1px #2dd4bf' : 'none',
                                  borderRadius: '0.375rem',
                                  '&:hover': { borderColor: '#2dd4bf' }
                                })
                              }}
                            />
                          </td>

                          <td className="py-2 px-3 border-r border-gray-100">
                            <input
                              type="text"
                              className="w-full py-1.5 px-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-center text-gray-700 font-medium cursor-not-allowed outline-none"
                              name="current_stock"
                              value={field.current_stock}
                              readOnly
                            />
                          </td>

                          <td className="py-2 px-3 border-r border-gray-100">
                            <input
                              type="number"
                              required
                              name="data_tonase"
                              className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-center text-teal-700 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                              value={field.data_tonase}
                              onChange={(event) => handleInputChange(index, event)}
                              onFocus={(e) => e.target.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                            />
                          </td>

                          <td className="py-2 px-3 border-r border-gray-100">
                            <input
                              type="number"
                              required
                              name="data_harga"
                              className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-right text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                              value={field.data_harga}
                              onChange={(event) => handleInputChange(index, event)}
                              onFocus={(e) => e.target.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                            />
                          </td>

                          <td className="py-2 px-3 border-r border-gray-100">
                            <input
                              type="text"
                              className="w-full py-1.5 px-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-right text-gray-800 font-bold cursor-not-allowed outline-none"
                              value={RupiahFormat(field.data_total || 0)}
                              readOnly
                            />
                          </td>

                          {/* Toggle Pembayaran UI Modern */}
                          <td className="py-2 px-3 border-r border-gray-100">
                            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                              <label className={`flex-1 flex flex-col items-center justify-center cursor-pointer py-1 px-2 rounded-md transition-all ${field.pembayaran_st === "cash" ? "bg-teal-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}>
                                <input
                                  type="radio"
                                  className="hidden"
                                  name={`pembayaran_st-${index}`}
                                  value="cash"
                                  onChange={() => handleInputChange(index, { target: { name: 'pembayaran_st', value: 'cash' } })}
                                  checked={field.pembayaran_st === "cash"}
                                />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Cash</span>
                              </label>
                              <label className={`flex-1 flex flex-col items-center justify-center cursor-pointer py-1 px-2 rounded-md transition-all ${field.pembayaran_st === "hutang" ? "bg-red-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}>
                                <input
                                  type="radio"
                                  className="hidden"
                                  name={`pembayaran_st-${index}`}
                                  value="hutang"
                                  onChange={() => handleInputChange(index, { target: { name: 'pembayaran_st', value: 'hutang' } })}
                                  checked={field.pembayaran_st === "hutang"}
                                />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Hutang</span>
                              </label>
                            </div>
                          </td>

                          <td className="py-2 px-2 text-center">
                            {index === 0 ? (
                              <button type="button" className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed" disabled>
                                <i className="fa fa-trash"></i>
                              </button>
                            ) : (
                              <button type="button" onClick={() => handleRemoveField(index)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors">
                                <i className="fa fa-trash"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Footer Grand Total dalam Tabel */}
                    <tr className="bg-gray-100/80 border-t-2 border-gray-300">
                      <td colSpan="7" className="text-right py-3 px-4 text-sm font-bold text-gray-700 tracking-wider border-r border-gray-300">
                        GRAND TOTAL PENGIRIMAN
                      </td>
                      <td className="text-right py-3 px-3 text-sm font-bold text-red-600 border-r border-gray-200 bg-red-50/50">
                        {RupiahFormat(resTtlPengiriman)}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Tombol Tambah & Submit */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
              <button
                type="button"
                onClick={handleAddField}
                className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors shadow-sm w-full md:w-auto justify-center"
              >
                <i className="fa fa-plus text-xs"></i> Tambah Baris Barang
              </button>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  type="submit"
                  value="simcetak"
                  name="type_submit"
                  className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <i className="fa fa-print"></i> Simpan & Cetak
                </button>
                <button
                  type="submit"
                  value="simpan"
                  name="type_submit"
                  className="flex-1 md:flex-none px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <i className="fa fa-save"></i> Simpan
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default TambahPengiriman;