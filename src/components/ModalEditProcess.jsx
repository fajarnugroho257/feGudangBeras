import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utilities/axiosInterceptor";

export default function ModalEditProcess({ id, isOpen, onClose }) {
  const token = localStorage.getItem("token");

  const [process_input_tgl, setProcess_input_tgl] = useState("");
  const [operasional, setOperasional] = useState("");
  const [process_output_tgl, setProcess_output_tgl] = useState("");

  const [barangOptionsCache, setBarangOptionsCache] = useState({});
  const [stockDataByIndex, setStockDataByIndex] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingBarang, setLoadingBarang] = useState(false);

  const [inputFields, setInputFields] = useState([]);
  const [outputFields, setOutputFields] = useState([]);

  // Fetch Barang
  const fetchBarangByType = useCallback(
    async (tipe, isOutput = false) => {
      if (barangOptionsCache[tipe] || loadingBarang) return barangOptionsCache[tipe];

      setLoadingBarang(true);
      try {
        const params = { tipe };
        if (isOutput) {
          params.is_process = 1;
        }
        const res = await api.get("/get-barang", {
          params: params,
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 200 && Array.isArray(res.data.dataBarang)) {
          const options = res.data.dataBarang.map((item) => ({
            value: item.id,
            label: item.nama,
          }));
          setBarangOptionsCache((prev) => ({ ...prev, [tipe]: options }));
          return options;
        }
      } catch (err) {
        console.error(`fetchBarangByType(${tipe}):`, err);
      } finally {
        setLoadingBarang(false);
      }
      return [];
    },
    [barangOptionsCache, token, loadingBarang]
  );

  // Fetch Stock for Input (Gabah)
  const fetchStock = useCallback(
    async (barangId) => {
      try {
        const res = await api.get("/get-stock", {
          params: { barang_id: barangId },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 200 && Array.isArray(res.data.dataStock)) {
          return res.data.dataStock;
        }
      } catch (err) {
        console.error(`fetchStock(${barangId}):`, err);
      }
      return [];
    },
    [token]
  );

  useEffect(() => {
    if (!isOpen || !id) return;
    
    const fetchDetail = async () => {
      const toastId = toast.loading("Mendapatkan data...");
      try {
        const res = await api.get(`/detail-process/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.status === 200) {
          const data = res.data.data;
          setProcess_input_tgl(data.process_input_tgl ? data.process_input_tgl.split("T")[0] : "");
          setOperasional(data.operasional || "");
          
          let outputObj = data.process_output || data.processOutput;
          if (Array.isArray(outputObj)) outputObj = outputObj[0];
          
          if (outputObj && outputObj.process_output_tgl) {
            setProcess_output_tgl(outputObj.process_output_tgl.split("T")[0]);
          } else {
            setProcess_output_tgl(new Date().toISOString().slice(0, 10));
          }
          
          const inData = data.process_input_data || data.processInputData || [];
          const outData = outputObj ? (outputObj.process_output_data || outputObj.processOutputData || []) : [];
          
          await fetchBarangByType('gabah', false);
          
          const mappedInputs = await Promise.all(inData.map(async (item, index) => {
             const stockInfo = await fetchStock(item.barang_id);
             setStockDataByIndex(prev => ({
               ...prev,
               [index]: {
                  stockData: stockInfo,
                  supplierOptions: stockInfo.map(s => ({
                     value: s.suplier_id,
                     label: (s.suplier?.suplier_nama || s.suplier?.nama || "Unknown") + " (Stok: " + s.stok + ")"
                  }))
               }
             }));
             
             let current_stock = 0;
             const entry = stockInfo.find(s => s.suplier_id === item.supplier_id);
             if (entry) current_stock = entry.stok;
             
             return {
                barang_id: item.barang_id,
                selectedBarang: item.barang ? { value: item.barang_id, label: item.barang.nama } : null,
                supplier_id: item.supplier_id,
                selectedSupplier: item.supplier ? { value: item.supplier_id, label: item.supplier.suplier_nama || item.supplier.nama } : null,
                current_stock: current_stock,
                tonase: item.tonase
             };
          }));
          
          setInputFields(mappedInputs);
          
          const mappedOutputs = outData.map(item => ({
             barang_tipe: item.barang?.tipe || 'beras',
             barang_id: item.barang_id,
             selectedBarang: item.barang ? { value: item.barang_id, label: item.barang.nama } : null,
             barang_nama: "",
             tonase: item.tonase
          }));
          
          for (let out of mappedOutputs) {
             await fetchBarangByType(out.barang_tipe, true);
          }
          
          setOutputFields(mappedOutputs);
          
          toast.update(toastId, { render: "Data berhasil dimuat!", type: "success", isLoading: false, autoClose: 2000 });
        }
      } catch (err) {
        toast.update(toastId, { render: "Gagal memuat data!", type: "error", isLoading: false, autoClose: 3000 });
      }
    };
    
    fetchDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isOpen, token]);

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
          label: (item.suplier?.suplier_nama || item.suplier?.nama) + " (Stok: " + item.stok + ")",
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

    const toastId = toast.loading("Menyimpan data...");
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

      const response = await api.post(`/edit-process/${id}`, params, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 200) {
        toast.update(toastId, {
          render: "Data berhasil diupdate!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        onClose(); // Triggers close and reload in parent
      } else {
        toast.update(toastId, {
          render: "Error saving data! " + response.status,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Error saving data! " + (error.response?.data?.message || error.message),
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      console.error("Error posting data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6 font-poppins">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-gray-50 w-full max-w-[1200px] h-full max-h-[95vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-5 md:px-8 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600">
              <i className="fa fa-edit text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 leading-tight">Ubah Proses Gabah</h2>
              <p className="text-xs text-gray-500">Edit data input dan hasil proses gabah</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <i className="fa fa-times text-lg" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 md:px-8 bg-gray-50/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* KIRI: PROCESS INPUT */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
                  <h3 className="font-bold text-lg text-teal-800">Process Input (Gabah)</h3>
                  <span className="text-xs font-bold bg-teal-100 text-teal-700 px-2 py-1 rounded">WAJIB</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Tanggal Input</label>
                    <input type="date" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all" value={process_input_tgl} onChange={(e) => setProcess_input_tgl(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Biaya Operasional</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Rp</span>
                      <input type="number" className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all" placeholder="0" value={operasional} onChange={(e) => setOperasional(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {inputFields.map((field, index) => (
                    <div key={`input-${index}`} className="bg-gray-50/50 border border-gray-200 rounded-xl p-4 shadow-sm relative">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                        <span className="font-bold text-gray-700 text-sm">Gabah #{index + 1}</span>
                        {index > 0 && <button type="button" onClick={() => handleRemoveInputField(index)} className="text-red-500 hover:bg-red-50 p-1 rounded"><i className="fa fa-trash text-xs"></i></button>}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Pilih Gabah</label>
                          <Select value={field.selectedBarang} onMenuOpen={() => fetchBarangByType('gabah', false)} onChange={(selected) => handleSelectBarangInput(index, selected)} options={barangOptionsCache['gabah'] || []} placeholder="Cari gabah..." isClearable menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Pilih Supplier (Dari Stok)</label>
                          <Select value={field.selectedSupplier} onChange={(selected) => handleSelectSupplierInput(index, selected)} options={stockDataByIndex[index]?.supplierOptions || []} placeholder="Pilih supplier..." isClearable menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Sisa Stok (Kg)</label>
                            <input type="text" className="w-full py-1.5 px-3 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-700 outline-none cursor-not-allowed" value={field.current_stock} readOnly />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-teal-600 uppercase mb-1 block">Tonase (Kg)</label>
                            <input type="number" min={0} step="any" required className="w-full py-1.5 px-3 bg-white border border-teal-300 rounded-md text-sm font-bold text-teal-700 outline-none focus:ring-2 focus:ring-teal-100" value={field.tonase} onChange={(e) => handleInputTonaseChange(index, e)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={handleAddInputField} className="mt-4 w-full py-2 bg-white border border-teal-200 text-teal-700 rounded-lg text-sm font-bold hover:bg-teal-50 transition-colors shadow-sm flex items-center justify-center gap-2"><i className="fa fa-plus text-xs"></i> Tambah Gabah</button>
              </div>

              {/* KANAN: PROCESS OUTPUT */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
                  <h3 className="font-bold text-lg text-emerald-800">Process Output (Hasil)</h3>
                  <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">OPSIONAL</span>
                </div>
                <div className="mb-5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Tanggal Output</label>
                  <input type="date" className="w-full md:w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all" value={process_output_tgl} onChange={(e) => setProcess_output_tgl(e.target.value)} />
                </div>
                <div className="space-y-4">
                  {outputFields.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm">Belum ada data output. Klik tombol di bawah untuk menambahkan hasil proses.</div>
                  ) : (
                    outputFields.map((field, index) => (
                      <div key={`output-${index}`} className="bg-gray-50/50 border border-gray-200 rounded-xl p-4 shadow-sm relative">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                          <span className="font-bold text-gray-700 text-sm">Hasil #{index + 1}</span>
                          <button type="button" onClick={() => handleRemoveOutputField(index)} className="text-red-500 hover:bg-red-50 p-1 rounded"><i className="fa fa-trash text-xs"></i></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Tipe Hasil</label>
                            <select className="w-full py-2 px-2 bg-white border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:ring-2 focus:ring-emerald-100" value={field.barang_tipe} onChange={(e) => handleOutputTipeChange(index, e)}><option value="beras">Beras</option><option value="katul">Katul</option><option value="sekam">Sekam</option></select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-emerald-600 uppercase mb-1 block">Tonase (Kg)</label>
                            <input type="number" min={0} step="any" required className="w-full py-1.5 px-3 bg-white border border-emerald-300 rounded-md text-sm font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-100" value={field.tonase} onChange={(e) => handleOutputTonaseChange(index, e)} />
                          </div>
                        </div>
                        {field.barang_tipe === "beras" && (
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Pilih Barang</label>
                            <Select value={field.selectedBarang} onMenuOpen={() => fetchBarangByType(field.barang_tipe, true)} onChange={(selected) => handleSelectBarangOutput(index, selected)} options={barangOptionsCache[field.barang_tipe] ? [...barangOptionsCache[field.barang_tipe], { value: 'new', label: '+ Barang Baru' }] : [{ value: 'new', label: '+ Barang Baru' }]} placeholder="Cari barang..." isClearable menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} />
                            {field.selectedBarang && field.selectedBarang.value === 'new' && <input type="text" className="w-full mt-2 py-1.5 px-3 bg-white border border-teal-300 rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-teal-100" placeholder="Ketik nama barang baru..." value={field.barang_nama} onChange={(e) => handleOutputBarangNamaChange(index, e)} required />}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <button type="button" onClick={handleAddOutputField} className="mt-4 w-full py-2 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-50 transition-colors shadow-sm flex items-center justify-center gap-2"><i className="fa fa-plus text-xs"></i> Tambah Hasil</button>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="p-5 md:px-8 bg-white border-t border-gray-200 flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">Batal</button>
            <button type="submit" className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2">
              {isSubmitting ? <span><i className="fa fa-spinner fa-spin"></i> Menyimpan...</span> : <span><i className="fa fa-save"></i> Simpan Perubahan</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
