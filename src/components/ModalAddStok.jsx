import React, { useState, useEffect } from "react";
import { getToken } from "../utilities/Auth";
import Input from "./Ui/Input";
import { toast } from "react-toastify";
import api from "../utilities/axiosInterceptor";
import Select from "react-select";

function ModalAddStok({ isOpen, onClose, reload }) {
  const [errors, setErrors] = useState({});
  const [barangOptions, setBarangOptions] = useState([]);
  const [suplierOptions, setSuplierOptions] = useState([]);
  
  const getInitialForm = () => ({
    barang_id: null,
    suplier_id: null,
    stok: "",
  });
  
  const [form, setForm] = useState(getInitialForm());

  useEffect(() => {
    if (isOpen) {
      fetchBarang();
      fetchSuplier();
      setErrors({}); // Reset error saat modal dibuka
    }
  }, [isOpen]);

  const fetchBarang = async () => {
    try {
      const response = await api.get('/get-barang', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (response.status === 200) {
        // Sesuaikan dengan struktur response API Anda
        const data = response.data.dataBarang || response.data.data || [];
        const options = data.map(item => ({
          value: item.id,
          label: item.nama || item.barang_nama
        }));
        setBarangOptions(options);
      }
    } catch (error) {
      console.error("Error fetching barang:", error);
    }
  };

  const fetchSuplier = async () => {
    try {
      const response = await api.get('/get-suplier', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (response.status === 200) {
        // Sesuaikan dengan struktur response API Anda
        const data = response.data.dataSuplier || response.data.data || [];
        const options = data.map(item => ({
          value: item.id || item.suplier_id,
          label: item.suplier_nama || item.nama
        }));
        setSuplierOptions(options);
      }
    } catch (error) {
      console.error("Error fetching suplier:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeSelect = (name, option) => {
    setForm((prev) => ({
      ...prev,
      [name]: option ? option.value : null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi frontend sederhana sebelum kirim
    if (!form.barang_id || !form.suplier_id || !form.stok) {
        toast.error("Harap isi semua field!");
        return;
    }

    const toastId = toast.loading("Sedang memproses stok...");
    try {
      const token = getToken();
      
      const response = await api.post(`/create-stock`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setErrors({});
        setForm(getInitialForm());
        toast.update(toastId, {
          render: response.data.message || "Data stok berhasil disimpan",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        reload(); // Refresh data di table utama
        onClose(); // Tutup modal
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
        toast.update(toastId, {
          render: "Periksa kembali inputan Anda",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        toast.update(toastId, {
          render: err?.response?.data?.message || "Terjadi kesalahan sistem",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 font-poppins">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="bg-white w-full max-w-xl h-auto max-h-[90vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 md:px-8 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
              <i className="fa fa-boxes text-lg"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 leading-tight">Manajemen Stok</h2>
              <p className="text-xs text-gray-500">Update atau tambah stok barang per supplier</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <i className="fa fa-times text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          <div className="flex-1 overflow-y-auto p-5 md:px-8 bg-gray-50/30">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              
              {/* Barang Select */}
              <div className="w-full">
                <label className="block mb-1.5 text-sm font-bold text-gray-600">Barang</label>
                <Select
                  value={barangOptions.find((opt) => opt.value === form.barang_id)}
                  onChange={(option) => handleChangeSelect("barang_id", option)}
                  options={barangOptions}
                  placeholder="-- Pilih Barang --"
                  isClearable
                  menuPortalTarget={document.body}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    control: (base, state) => ({
                      ...base,
                      minHeight: '40px',
                      borderRadius: '0.5rem',
                      borderColor: state.isFocused ? '#2dd4bf' : '#e5e7eb',
                    })
                  }}
                />
                {errors.barang_id && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium"><i className="fa fa-exclamation-circle mr-1"></i> {errors.barang_id[0]}</p>
                )}
              </div>

              {/* Suplier Select */}
              <div className="w-full">
                <label className="block mb-1.5 text-sm font-bold text-gray-600">Suplier</label>
                <Select
                  value={suplierOptions.find((opt) => opt.value === form.suplier_id)}
                  onChange={(option) => handleChangeSelect("suplier_id", option)}
                  options={suplierOptions}
                  placeholder="-- Pilih Suplier --"
                  isClearable
                  menuPortalTarget={document.body}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    control: (base, state) => ({
                      ...base,
                      minHeight: '40px',
                      borderRadius: '0.5rem',
                      borderColor: state.isFocused ? '#2dd4bf' : '#e5e7eb',
                    })
                  }}
                />
                {errors.suplier_id && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium"><i className="fa fa-exclamation-circle mr-1"></i> {errors.suplier_id[0]}</p>
                )}
              </div>

              {/* Input Stok */}
              <div className="w-full">
                <Input
                  label="Jumlah Stok"
                  name="stok"
                  type="number"
                  value={form.stok}
                  onChange={handleChange}
                  placeholder="Contoh: 100"
                  error={errors.stok ? errors.stok[0] : null}
                  className="w-full border border-gray-200 py-2 px-3 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                />
              </div>

            </div>
          </div>

          <div className="p-5 md:px-8 bg-white border-t border-gray-100 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <i className="fa fa-save"></i> Simpan Data
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}

export default ModalAddStok;