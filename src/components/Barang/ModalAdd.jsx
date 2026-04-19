import React, { useState } from "react";
import { getToken } from "../../utilities/Auth";
import Input from "../../components/Ui/Input";
import { toast } from "react-toastify";
import api from "../../utilities/axiosInterceptor";
import Select from "react-select";

function ModalAdd({ isOpen, onClose, reload }) {
  const [errors, setErrors] = useState({});
  const getInitialForm = () => ({
    nama: "",
    tipe: "",
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

  const handleChangeSelect = (option) => {
    setForm((prev) => ({
      ...prev,
      tipe: option ? option.value : null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Menyimpan data...");
    try {
      const token = getToken();
      const response = await api.post(`create-barang`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (response.data.success) {
        setErrors({}); // reset error
        // optional reset form
        setForm(getInitialForm());
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 1000,
        });
        reload();
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
        // toast.update("Terjadi kesalahan server", { id: toastId });
        toast.update(toastId, {
          render:
            err?.response?.data?.message || err.message || "Terjadi kesalahan",
          type: "error",
          isLoading: false,
          autoClose: 1000,
        });
      }
    }
  };

  const tipeOptions = [
    { value: "gabah", label: "Gabah" },
    { value: "beras", label: "Beras" },
    { value: "katul", label: "Katul" },
    { value: "sekam", label: "Sekam" },
  ];
  if (!isOpen) return null;
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="fixed inset-0 flex items-center justify-center z-50 font-poppins p-4"
      >
        {/* Overlay */}
        {/* <div className="absolute inset-0 bg-gray-900 opacity-50" onClick={onClose}></div> */}
        <div className="absolute inset-0 bg-gray-900 opacity-50"></div>

        {/* Modal Card */}
        <div className="bg-white w-[95%] md:w-[60%] h-[90%] p-6 rounded-lg shadow-lg relative z-10 flex flex-col">
          {/* Header: Tetap di atas */}
          <div className="flex-none">
            <h2 className="text-base md:text-lg font-bold mb-2 text-black">
              Tambah Data Barang
            </h2>
            <div className="h-[2px] w-full bg-colorPrimary mb-4"></div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                <Input
                  label="Nama Barang"
                  name="nama"
                  type="text"
                  value={form.nama}
                  onChange={handleChange}
                  placeholder="Nama Barang"
                  error={errors.nama}
                />
                <div className="w-full">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Tipe
                  </label>
                  <Select
                    value={tipeOptions.find((opt) => opt.value === form.tipe)}
                    onChange={handleChangeSelect}
                    options={tipeOptions}
                    placeholder="Pilih Tipe"
                    isClearable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                  {errors.tipe && (
                    <p className="mt-1 text-sm text-red-500">{errors.tipe}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer: Tetap di bawah */}
          <div className="flex-none flex justify-between mt-5 pt-4 border-t">
            <button
              className="px-4 py-2 bg-gray-200 border border-gray-300 font-bold text-black rounded hover:bg-gray-300 transition-colors"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="submit"
              className="px-2 md:px-4 py-1 md:py-2 bg-colorBlue font-poppins text-colorGray rounded hover:bg-blue-400"
            >
              <i className="fa fa-save"></i> Simpan
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export default ModalAdd;
