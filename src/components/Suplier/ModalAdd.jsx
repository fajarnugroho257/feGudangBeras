import React, { useState } from "react";
import { getToken } from "../../utilities/Auth";
import Input from "../../components/Ui/Input";
import { toast } from "react-toastify";
import api from "../../utilities/axiosInterceptor";

function ModalAdd({ isOpen, onClose, reload }) {
  const [errors, setErrors] = useState({});
  const getInitialForm = () => ({
    suplier_nama: "",
    alamat: "",
    no_hp: "",
  });
  const [form, setForm] = useState(getInitialForm());

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    setForm((prev) => {
      const updated = { ...prev, [name]: newValue };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Menyimpan data...");
    try {
      const token = getToken();
      const response = await api.post(`create-suplier`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (response.data.success) {
        setErrors({}); 
        setForm(getInitialForm());
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 1000,
        });
        reload();
        onClose(); // Tutup modal otomatis jika sukses
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        toast.update(toastId, {
          render: "Validasi gagal",
          type: "error",
          isLoading: false,
          autoClose: 1000,
        });
      } else {
        toast.update(toastId, {
          render: err?.response?.data?.message || err.message || "Terjadi kesalahan",
          type: "error",
          isLoading: false,
          autoClose: 1000,
        });
      }
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 font-poppins">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="bg-white w-full max-w-3xl h-auto max-h-[90vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-5 md:px-8 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
              <i className="fa fa-user-plus text-lg"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 leading-tight">Tambah Suplier</h2>
              <p className="text-xs text-gray-500">Masukkan data kontak suplier baru</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <i className="fa fa-times text-lg"></i>
          </button>
        </div>

        {/* Form Wrap */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 md:px-8 bg-gray-50/30">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="w-full">
                  <Input
                    label="Nama Suplier"
                    name="suplier_nama"
                    type="text"
                    value={form.suplier_nama}
                    onChange={handleChange}
                    placeholder="Contoh: PT. Makmur Jaya"
                    error={errors.suplier_nama}
                    className="w-full border border-gray-200 py-2.5 px-3 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                  />
                </div>
                
                <div className="w-full">
                  <Input
                    label="Nomor HP / Telepon"
                    name="no_hp"
                    type="text"
                    value={form.no_hp}
                    onChange={handleChange}
                    placeholder="Contoh: 081234567890"
                    error={errors.no_hp}
                    className="w-full border border-gray-200 py-2.5 px-3 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                  />
                </div>
                
                <div className="w-full md:col-span-2">
                  <Input
                    label="Alamat Lengkap"
                    name="alamat"
                    type="text"
                    value={form.alamat}
                    onChange={handleChange}
                    placeholder="Masukkan alamat lengkap suplier..."
                    error={errors.alamat}
                    className="w-full border border-gray-200 py-2.5 px-3 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Modal */}
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
              <i className="fa fa-save"></i> Simpan
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}

export default ModalAdd;