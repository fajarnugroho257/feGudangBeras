import React, { useState, useCallback } from "react";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import api from "../utilities/axiosInterceptor";

function TambahProcess() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [process_input_tgl, setProcess_input_tgl] = useState(new Date().toISOString().slice(0, 10));
  const [operasional, setOperasional] = useState("");
  const [process_output_tgl, setProcess_output_tgl] = useState(new Date().toISOString().slice(0, 10));

  const [barangOptionsCache, setBarangOptionsCache] = useState({});
  const [stockDataByIndex, setStockDataByIndex] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingBarang, setLoadingBarang] = useState(false);

  const [inputFields, setInputFields] = useState([
    {
      barang_id: null,
      selectedBarang: null,
      supplier_id: null,
      selectedSupplier: null,
      current_stock: 0,
      tonase: "",
    },
  ]);

  const [outputFields, setOutputFields] = useState([]);

  // Fetch Barang
  const fetchBarangByType = useCallback(
    async (tipe, isOutput = false) => {
      if (barangOptionsCache[tipe] || loadingBarang) return;

      setLoadingBarang(true);
      try {
        const params = { tipe };
        if (isOutput) {
          params.is_process = 1;
        }
        const response = await api.get('/get-barang', {
          params: params,
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200 && Array.isArray(response.data.dataBarang)) {
          const options = response.data.dataBarang.map((item) => ({
            value: item.id,
            label: item.nama,
          }));
          setBarangOptionsCache((prev) => ({ ...prev, [tipe]: options }));
        }
      } catch (error) {
        console.error(`Failed to fetch barang for type ${tipe}:`, error);
      } finally {
        setLoadingBarang(false);
      }
    },
    [barangOptionsCache, token, loadingBarang],
  );

  // Fetch Stock for Input (Gabah)
  const fetchStock = useCallback(
    async (barangId) => {
      try {
        const response = await api.get('/get-stock', {
          params: { barang_id: barangId },
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.status === 200 ? response.data.dataStock : [];
      } catch (error) { return []; }
    },
    [token],
  );

  // INPUT HANDLERS
  const handleAddInputField = () => {
    setInputFields([
      ...inputFields,
      {
        barang_id: null,
        selectedBarang: null,
        supplier_id: null,
        selectedSupplier: null,
        current_stock: 0,
        tonase: "",
      },
    ]);
  };

  const handleRemoveInputField = (index) => {
    const values = [...inputFields];
    values.splice(index, 1);
    setInputFields(values);
  };

  const handleSelectBarangInput = (index, selected) => {
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

  const handleSelectSupplierInput = (index, selected) => {
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

  const handleInputTonaseChange = (index, event) => {
    const values = [...inputFields];
    values[index].tonase = event.target.value;
    setInputFields(values);
  };

  // OUTPUT HANDLERS
  const handleAddOutputField = () => {
    setOutputFields([
      ...outputFields,
      {
        barang_tipe: "beras",
        barang_id: null,
        selectedBarang: null,
        barang_nama: "",
        tonase: "",
      },
    ]);
  };

  const handleRemoveOutputField = (index) => {
    const values = [...outputFields];
    values.splice(index, 1);
    setOutputFields(values);
  };

  const handleOutputTipeChange = (index, event) => {
    const values = [...outputFields];
    values[index].barang_tipe = event.target.value;
    values[index].selectedBarang = null;
    values[index].barang_id = null;
    fetchBarangByType(event.target.value, true);
    setOutputFields(values);
  };

  const handleSelectBarangOutput = (index, selected) => {
    const values = [...outputFields];
    values[index].selectedBarang = selected;
    values[index].barang_id = selected && selected.value !== 'new' ? selected.value : null;
    setOutputFields(values);
  };

  const handleOutputBarangNamaChange = (index, event) => {
    const values = [...outputFields];
    values[index].barang_nama = event.target.value;
    setOutputFields(values);
  };

  const handleOutputTonaseChange = (index, event) => {
    const values = [...outputFields];
    values[index].tonase = event.target.value;
    setOutputFields(values);
  };

  const handleTab = (event) => {
    navigate(`/${event}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return; 

    if (inputFields.length === 0) {
      toast.error("Process Input (Gabah) wajib diisi minimal 1 data.");
      return;
    }

    for (let i = 0; i < inputFields.length; i++) {
      if (!inputFields[i].barang_id) {
        toast.error(`Pilih barang pada Process Input baris ${i + 1}`);
        return;
      }
      if (!inputFields[i].supplier_id) {
        toast.error(`Pilih supplier pada Process Input baris ${i + 1}`);
        return;
      }
      if (!inputFields[i].tonase) {
        toast.error(`Isi tonase pada Process Input baris ${i + 1}`);
        return;
      }
    }

    for (let i = 0; i < outputFields.length; i++) {
      if (outputFields[i].barang_tipe === "beras" && !outputFields[i].selectedBarang) {
        toast.error(`Pilih barang pada Process Output baris ${i + 1}`);
        return;
      }
      if (
        outputFields[i].barang_tipe === "beras" &&
        outputFields[i].selectedBarang?.value === "new" &&
        !outputFields[i].barang_nama
      ) {
        toast.error(`Isi nama barang baru pada Process Output baris ${i + 1}`);
        return;
      }
      if (!outputFields[i].tonase) {
        toast.error(`Isi tonase pada Process Output baris ${i + 1}`);
        return;
      }
    }

    setIsSubmitting(true); 

    const toastId = toast.loading("Sending data...");
    try {
      const dataInput = {
        process_input_tgl: process_input_tgl,
        operasional: operasional || 0,
      };

      const sanitizedFields = inputFields.map((item) => ({
        barang_id: item.barang_id,
        supplier_id: item.supplier_id,
        tonase: item.tonase,
      }));

      let dataOutput = null;
      let sanitizedOutputFields = [];

      if (outputFields.length > 0) {
        dataOutput = {
          process_output_tgl: process_output_tgl,
        };
        
        for (let item of outputFields) {
          let b_id = item.barang_id;
          
          if (item.barang_tipe !== "beras") {
            b_id = null;
          }
          
          sanitizedOutputFields.push({
            barang_id: b_id,
            barang_tipe: item.barang_tipe,
            barang_nama: item.selectedBarang?.value === 'new' ? item.barang_nama : null,
            supplier_id: null,
            tonase: item.tonase,
          });
        }
      }

      let params = {
        processInput: dataInput,
        processInputData: sanitizedFields,
      };

      if (dataOutput && sanitizedOutputFields.length > 0) {
        params.processOutput = dataOutput;
        params.processOutputData = sanitizedOutputFields;
      }

      const response = await api.post("/add-process", params, {
        headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      
      if (response.status === 200) {
        setProcess_input_tgl(new Date().toISOString().slice(0, 10));
        setOperasional("");
        setProcess_output_tgl(new Date().toISOString().slice(0, 10));
        setInputFields([
          {
            barang_id: null,
            selectedBarang: null,
            supplier_id: null,
            selectedSupplier: null,
            current_stock: 0,
            tonase: "",
          },
        ]);
        setOutputFields([]);

        toast.update(toastId, {
          render: "Data sent successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: "Error sending data! " + response.status,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Error sending data! " + (error.response?.data?.message || error.message),
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      console.error("Error posting data:", error);
    } finally {
      setIsSubmitting(false); 
    }
  };

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
          <button
            className="px-4 py-2 text-gray-500 hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors"
            onClick={() => handleTab("tambah-pengiriman")}
          >
            Pengiriman
          </button>
          <button className="px-4 py-2 bg-teal-50 text-teal-700 font-bold rounded-lg text-sm border border-teal-200 transition-colors">
            Proses Gabah
          </button>
          <button
            className="px-4 py-2 text-gray-500 hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors"
            onClick={() => handleTab("tambah-karyawan")}
          >
            Karyawan
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* KIRI: PROCESS INPUT (HANYA GABAH) */}
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
                <h3 className="font-bold text-lg text-teal-800">Process Input (Gabah)</h3>
                <span className="text-xs font-bold bg-teal-100 text-teal-700 px-2 py-1 rounded">WAJIB</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Tanggal Input</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-100 outline-none"
                    value={process_input_tgl}
                    onChange={(e) => setProcess_input_tgl(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Biaya Operasional</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Rp</span>
                    <input
                      type="number"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-100 outline-none"
                      placeholder="0"
                      value={operasional}
                      onChange={(e) => setOperasional(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {inputFields.map((field, index) => (
                  <div key={`input-${index}`} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                      <span className="font-bold text-gray-700 text-sm">Gabah #{index + 1}</span>
                      {index > 0 && (
                        <button type="button" onClick={() => handleRemoveInputField(index)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                          <i className="fa fa-trash text-xs"></i>
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Pilih Gabah</label>
                        <Select
                          value={field.selectedBarang}
                          onMenuOpen={() => fetchBarangByType('gabah', false)}
                          onChange={(selected) => handleSelectBarangInput(index, selected)}
                          options={barangOptionsCache['gabah'] || []}
                          placeholder="Cari gabah..."
                          isClearable
                          menuPortalTarget={document.body}
                          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Pilih Supplier (Dari Stok)</label>
                        <Select
                          value={field.selectedSupplier}
                          onChange={(selected) => handleSelectSupplierInput(index, selected)}
                          options={stockDataByIndex[index]?.supplierOptions || []}
                          placeholder="Pilih supplier..."
                          isClearable
                          menuPortalTarget={document.body}
                          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Sisa Stok (Kg)</label>
                          <input
                            type="text"
                            className="w-full py-1.5 px-3 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-700 outline-none"
                            value={field.current_stock}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-teal-600 uppercase mb-1 block">Tonase (Kg)</label>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            required
                            className="w-full py-1.5 px-3 bg-white border border-teal-300 rounded-md text-sm font-bold text-teal-700 outline-none focus:ring-2 focus:ring-teal-100"
                            value={field.tonase}
                            onChange={(e) => handleInputTonaseChange(index, e)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddInputField}
                className="mt-4 w-full py-2 bg-white border border-teal-200 text-teal-700 rounded-lg text-sm font-bold hover:bg-teal-50 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <i className="fa fa-plus text-xs"></i> Tambah Gabah
              </button>
            </div>

            {/* KANAN: PROCESS OUTPUT (OPSIONAL) */}
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
                <h3 className="font-bold text-lg text-emerald-800">Process Output (Hasil)</h3>
                <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded">OPSIONAL</span>
              </div>

              <div className="mb-5">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Tanggal Output</label>
                <input
                  type="date"
                  className="w-full md:w-1/2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-100 outline-none"
                  value={process_output_tgl}
                  onChange={(e) => setProcess_output_tgl(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                {outputFields.length === 0 ? (
                  <div className="text-center py-6 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm">
                    Belum ada data output. Klik tombol di bawah untuk menambahkan hasil proses.
                  </div>
                ) : (
                  outputFields.map((field, index) => (
                    <div key={`output-${index}`} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                        <span className="font-bold text-gray-700 text-sm">Hasil #{index + 1}</span>
                        <button type="button" onClick={() => handleRemoveOutputField(index)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                          <i className="fa fa-trash text-xs"></i>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Tipe Hasil</label>
                          <select
                            className="w-full py-2 px-2 bg-white border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:ring-2 focus:ring-emerald-100"
                            value={field.barang_tipe}
                            onChange={(e) => handleOutputTipeChange(index, e)}
                          >
                            <option value="beras">Beras</option>
                            <option value="katul">Katul</option>
                            <option value="sekam">Sekam</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-emerald-600 uppercase mb-1 block">Tonase (Kg)</label>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            required
                            className="w-full py-1.5 px-3 bg-white border border-emerald-300 rounded-md text-sm font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-100"
                            value={field.tonase}
                            onChange={(e) => handleOutputTonaseChange(index, e)}
                          />
                        </div>
                      </div>

                      {field.barang_tipe === "beras" && (
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Pilih Barang</label>
                          <Select
                            value={field.selectedBarang}
                            onMenuOpen={() => fetchBarangByType(field.barang_tipe, true)}
                            onChange={(selected) => handleSelectBarangOutput(index, selected)}
                          options={
                            barangOptionsCache[field.barang_tipe]
                              ? [...barangOptionsCache[field.barang_tipe], { value: 'new', label: '+ Barang Baru' }]
                              : [{ value: 'new', label: '+ Barang Baru' }]
                          }
                            placeholder="Cari barang..."
                            isClearable
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                          />
                        {field.selectedBarang && field.selectedBarang.value === 'new' && (
                          <input
                            type="text"
                            className="w-full mt-2 py-1.5 px-3 bg-white border border-teal-300 rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-teal-100"
                            placeholder="Ketik nama barang baru..."
                            value={field.barang_nama}
                            onChange={(e) => handleOutputBarangNamaChange(index, e)}
                            required
                          />
                        )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={handleAddOutputField}
                className="mt-4 w-full py-2 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-50 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <i className="fa fa-plus text-xs"></i> Tambah Hasil
              </button>
            </div>

          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-colors shadow-md flex items-center gap-2"
            >
              {isSubmitting ? (
                <span><i className="fa fa-spinner fa-spin"></i> Menyimpan...</span>
              ) : (
                <span><i className="fa fa-save"></i> Simpan Process</span>
              )}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default TambahProcess;