import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import RupiahFormat from "../utilities/RupiahFormat";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utilities/axiosInterceptor";

function ModalEditPengiriman({ pengiriman_id, isOpen, onClose }) {
  const token = localStorage.getItem("token");

  const [pengiriman_tgl, setPengiriman_tgl] = useState("");
  const [nama_pembeli, setNama_pembeli] = useState("");
  const [uang_muka, setUang_muka] = useState("");
  const [status, setStatus] = useState("yes");

  const [inputFieldsPengiriman, setInputFieldsPengiriman] = useState([]);
  const [barangOptionsCache, setBarangOptionsCache] = useState({});
  const [supplierOptionsCache, setSupplierOptionsCache] = useState([]);
  const [stockDataByIndex, setStockDataByIndex] = useState({});

  const handlePengiriman_tgl = (event) => setPengiriman_tgl(event.target.value);
  const handleNama_pembeli = (event) => setNama_pembeli(event.target.value);
  const handleUang_muka = (event) => setUang_muka(event.target.value);
  const handleStatus = (event) => setStatus(event.target.value);

  const fetchBarangByType = useCallback(async (tipe) => {
    if (barangOptionsCache[tipe]) return barangOptionsCache[tipe];
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
        setBarangOptionsCache((prev) => ({ ...prev, [tipe]: options }));
        return options;
      }
    } catch (error) {
      console.error(`Failed to fetch barang for type ${tipe}:`, error);
    }
    return [];
  }, [barangOptionsCache, token]);

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

  const fetchStock = useCallback(async (barangId) => {
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
  }, [token]);

  useEffect(() => {
    fetchBarangByType('beras');
    fetchBarangByType('katul');
    fetchBarangByType('sekam');
    fetchSuppliers();
  }, [fetchBarangByType, fetchSuppliers]);

  useEffect(() => {
    if (!isOpen || !pengiriman_id) return;
    const toastId = toast.loading("Getting data...");
    const fetchData = async () => {
      try {
        const response = await api.get(`/detail-Pengiriman/${pengiriman_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const resData = response.data.data;
          
          const formattedDate = resData.pengiriman_tgl
            ? resData.pengiriman_tgl.split("T")[0]
            : "";
          
          setPengiriman_tgl(formattedDate);
          setNama_pembeli(resData.nama_pembeli || "");
          setUang_muka(resData.uang_muka || "");
          setStatus(resData.status || "yes");

          const listPengiriman = resData.listPengiriman || [];
          
          const processedData = await Promise.all(listPengiriman.map(async (item, index) => {
            const barang_tipe = item.barang?.tipe || "beras"; 
            const fetchedBarangOptions = await fetchBarangByType(barang_tipe);
            
            let barangName = item.barang?.nama || `Barang ID ${item.barang_id}`;
            if (fetchedBarangOptions && item.barang_id) {
              const matchedBarang = fetchedBarangOptions.find(b => b.value === item.barang_id);
              if (matchedBarang) {
                barangName = matchedBarang.label;
              }
            }

            // Load stock for this barang
            let current_stock = 0;
            let supplierOptions = [];
            let suplierName = `Supplier ${item.supplier_id}`;
            if (item.barang_id) {
               const stockData = await fetchStock(item.barang_id);
               supplierOptions = stockData.map((stk) => ({
                 value: stk.suplier_id,
                 label: stk.suplier?.suplier_nama + " (Stok: " + stk.stok + ")",
               }));
               
               setStockDataByIndex((prev) => ({
                 ...prev,
                 [index]: { stockData, supplierOptions },
               }));
               
               const stockEntry = stockData.find(stk => stk.suplier_id === item.supplier_id);
               if (stockEntry) {
                 current_stock = stockEntry.stok;
                 suplierName = stockEntry.suplier?.suplier_nama;
               }
            }

            const selectedBarang = item.barang_id ? { value: item.barang_id, label: barangName } : null;
            const selectedSupplier = item.supplier_id ? { value: item.supplier_id, label: suplierName } : null;

            return {
              id: item.id,
              barang_tipe: barang_tipe,
              barang_id: item.barang_id,
              selectedBarang,
              supplier_id: item.supplier_id,
              selectedSupplier,
              current_stock,
              data_tonase: item.data_tonase || "",
              data_harga: item.data_harga || "",
              data_total: item.data_total || "",
              pembayaran_st: item.pembayaran_st || "cash",
            };
          }));

          setInputFieldsPengiriman(processedData);

          toast.update(toastId, {
            render: "Data getting successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
        } else {
          toast.update(toastId, {
            render: "Error getting data!" + response.status,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
      } catch (error) {
        toast.update(toastId, {
          render: "Error getting data! " + error.message,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pengiriman_id, isOpen, token]);

  const handleAddField = () => {
    setInputFieldsPengiriman([
      ...inputFieldsPengiriman,
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
  };

  const handleRemoveField = (index) => {
    const values = [...inputFieldsPengiriman];
    values.splice(index, 1);
    setInputFieldsPengiriman(values);
  };

  const handleInputChange = (index, event) => {
    const values = [...inputFieldsPengiriman];

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

    setInputFieldsPengiriman(values);
  };

  const handleSelectBarang = (index, selected) => {
    const values = [...inputFieldsPengiriman];
    values[index].selectedBarang = selected;
    values[index].barang_id = selected ? selected.value : null;
    values[index].current_stock = 0;
    values[index].selectedSupplier = null;
    values[index].supplier_id = null;
    setInputFieldsPengiriman(values);

    if (selected && selected.value) {
      fetchStock(selected.value).then((stockData) => {
        const supplierOptions = stockData.map((item) => ({
          value: item.suplier_id,
          label: item.suplier?.suplier_nama + " (Stok: " + item.stok + ")",
        }));
        setStockDataByIndex((prev) => ({
          ...prev,
          [index]: { stockData, supplierOptions },
        }));
      });
    }
  };

  const handleSelectSupplier = (index, selected) => {
    const values = [...inputFieldsPengiriman];
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
    setInputFieldsPengiriman(values);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const toastId = toast.loading("Sending data...");
    try {
      const pengirimanData = {
        id: pengiriman_id,
        pengiriman_tgl: pengiriman_tgl,
        nama_pembeli: nama_pembeli || null,
        uang_muka: uang_muka || null,
        status: status || null,
      };
      const sanitizedFields = inputFieldsPengiriman.map((item) => ({
        id: item.id,
        barang_id: item.barang_id || null,
        data_tonase: item.data_tonase,
        data_harga: item.data_harga,
        data_total: item.data_total,
        pembayaran_st: item.pembayaran_st || null,
        supplier_id: item.supplier_id || null,
      }));
      
      let params = {
        pengiriman_id: pengiriman_id,
        formData: sanitizedFields,
        pengirimanData: pengirimanData,
      };

      const response = await api.post("/edit-Pengiriman", params, {
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
        onClose();
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
    }
  };

  if (!isOpen) return null;

  const resTtlPengiriman = inputFieldsPengiriman.reduce(
    (sum, val) => sum + Number(val.data_total || 0),
    0,
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6 font-poppins">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-[1400px] h-full max-h-[95vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-5 md:px-8 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
              <i className="fa fa-truck text-lg"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 leading-tight">Ubah Pengiriman</h2>
              <p className="text-xs text-gray-500">Edit detail dan atur barang pengiriman</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <i className="fa fa-times text-lg"></i>
          </button>
        </div>
        
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          {/* Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-5 md:px-8 bg-gray-50/30">
            
            {/* Header Data Pengiriman (Cards) */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Tgl Pengiriman</label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                  name="pengiriman_tgl"
                  value={pengiriman_tgl}
                  onChange={handlePengiriman_tgl}
                  required
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Pembeli</label>
                <div className="relative">
                  <i className="fa fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                    placeholder="Nama lengkap"
                    name="nama_pembeli"
                    value={nama_pembeli}
                    onChange={handleNama_pembeli}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Uang Muka</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Rp</span>
                  <input
                    type="number"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                    placeholder="0"
                    name="uang_muka"
                    value={uang_muka}
                    onChange={handleUang_muka}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Status Publish</label>
                <select
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all cursor-pointer"
                  name="status"
                  value={status}
                  onChange={handleStatus}
                >
                  <option value="yes">Yes (Publish)</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* List Barang Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-12">No</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-28">Tipe</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56">Barang</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56">Supplier</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-24">Stok</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-28">Tonase</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200 w-32">Harga</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200 w-32">Total</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-32">Pembayaran</th>
                      <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center w-14">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inputFieldsPengiriman.map((field, index) => {
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
                              placeholder="Pilih Barang"
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
                              placeholder="Pilih Supplier"
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
                              className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-center text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
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
                              name="data_total"
                              value={RupiahFormat(field.data_total || 0)}
                              readOnly
                            />
                          </td>

                          <td className="py-2 px-3 border-r border-gray-100">
                            <select
                              className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all cursor-pointer"
                              name="pembayaran_st"
                              value={field.pembayaran_st}
                              onChange={(event) => handleInputChange(index, event)}
                            >
                              <option value="cash">Cash</option>
                              <option value="hutang">Hutang</option>
                            </select>
                          </td>

                          <td className="py-2 px-2 text-center">
                            {rowNumber === 1 ? (
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

                    {/* Baris Total di dalam Tabel */}
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

            {/* Tombol Tambah Baris */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddField}
                className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors shadow-sm"
              >
                <i className="fa fa-plus text-xs"></i> Tambah Baris Pengiriman
              </button>
            </div>
            
          </div>

          {/* Footer Modal (Fixed Bawah) */}
          <div className="p-5 md:px-8 bg-white border-t border-gray-100 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <i className="fa fa-save"></i> Simpan Perubahan
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}

export default ModalEditPengiriman;