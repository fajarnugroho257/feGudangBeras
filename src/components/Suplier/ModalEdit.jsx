import React, { useEffect, useState } from "react";
import { getToken } from "../../utilities/Auth";
import Input from "../Ui/Input";
import { toast } from "react-toastify";
import api from "../../utilities/axiosInterceptor";

function ModalEdit({ id, isOpen, onClose, reload }) {
  const [datas, setDatas] = useState([]);
  const [errors, setErrors] = useState({});

  const fectData = async (id) => {
    try {
      const toastId = toast.loading("Mendapatkan data...");
      const token = localStorage.getItem("token");
      const response = await api.get(`get-suplier-by-id/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      //get response data
      const data = await response.data.detail;
      console.log(data);
      toast.update(toastId, {
        render: response.data.message,
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
      setForm(data);
      setDatas(data);
    } catch (error) {}
  };
  useEffect(() => {
    fectData(id);
  }, [id]);

  const [form, setForm] = useState([]);

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
      // console.log(form);
      const response = await api.post(`update-suplier/${id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setErrors({}); // reset error
        // optional reset form
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 1000,
        });
        reload();
      }
    } catch (err) {
      alert("aa");
      console.log(err.response);
      if (err.response?.status === 422) {
        console.log(err.response.data.errors);
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
              Ubah Data Suplier
            </h2>
            <div className="h-[2px] w-full bg-colorPrimary mb-4"></div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Input
                  label="Nama Suplier"
                  name="suplier_nama"
                  type="text"
                  value={form.suplier_nama}
                  onChange={handleChange}
                  placeholder="Nama Suplier"
                  error={errors.suplier_nama}
                />
                <Input
                  label="Alamat"
                  name="alamat"
                  type="text"
                  value={form.alamat}
                  onChange={handleChange}
                  placeholder="Alamat"
                  error={errors.alamat}
                />
                <Input
                  label="No Hp"
                  name="no_hp"
                  type="text"
                  value={form.no_hp}
                  onChange={handleChange}
                  placeholder="No Hp"
                  error={errors.no_hp}
                />
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

export default ModalEdit;
