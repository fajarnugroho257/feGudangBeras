import React, { useEffect, useState, useCallback } from "react";
import RupiahFormat from "../utilities/RupiahFormat";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utilities/axiosInterceptor";
import Select from 'react-select';

function ModalEditPembelian({ id, isOpen, onClose }) {
  // TOKEN
  const token = localStorage.getItem("token");
  const [inputFields, setInputFields] = useState([]);
  const [barangOptionsCache, setBarangOptionsCache] = useState({});
  useEffect(() => {
    const toastId = toast.loading("Getting data...");
    const fectData = async () => {
      //fetching
      const response = await api.get(`/detail-Pembelian/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
        },
      });
      // console.log(response.status);
      if (response.status === 200) {
        //get response data
        const data = await response.data.data.pembelian_data;
        // console.log(data);
        //assign response data to state "posts"
        const processedData = data.map((item) => ({
          ...item,
          barang_tipe: item.barang ? item.barang.tipe : 'beras',
          selectedBarang: item.barang ? { value: item.barang_id, label: item.barang.nama } : null,
        }));
        setInputFields(processedData);
        const suplier = await response.data.data;

        // ambil hanya tanggal
        const formattedDate = suplier.pembelian_tgl
          ? suplier.pembelian_tgl.split("T")[0]
          : "";


        setsuplier_nama(suplier.suplier_nama);
        setsuplier_tgl(formattedDate);
        setsuplier_id(suplier.suplier_id);
        //
        toast.update(toastId, {
          render: "Data getting successfully!",
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
    };
    //panggil method "fetchData"
    fectData();
  }, [id, token]);

  const fetchBarangByType = useCallback(
    async (tipe) => {
      if (barangOptionsCache[tipe]) {
        return; // Already cached
      }

      try {
        const response = await api.get('/get-barang', {
          params: { tipe },
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  useEffect(() => {
    fetchBarangByType('beras');
    fetchBarangByType('gabah');
  }, [fetchBarangByType]);

  const [suplier_nama, setsuplier_nama] = useState("");
  const [suplier_tgl, setsuplier_tgl] = useState("");
  const [suplier_id, setsuplier_id] = useState("");
  //
  const handleSuplier_nama = (event) => {
    setsuplier_nama(event.target.value);
  };
  //
  const handleSuplier_tgl = (event) => {
    setsuplier_tgl(event.target.value);
  };

  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      {
        pembelian_id: "",
        pembayaran: "",
        barang_id: "",
        barang_nama: "",
        barang_tipe: "beras",
        pembelian_kotor: "",
        pembelian_potongan: "",
        pembelian_bersih: "",
        pembelian_harga: "",
        pembelian_total: "",
        pembelian_nota_st: "no",
        selectedBarang: null,
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
    values[index][event.target.name] = event.target.value;

    // If barang_tipe changed, fetch barang for that type
    if (event.target.name === 'barang_tipe') {
      fetchBarangByType(event.target.value);
    }

    setInputFields(values);
  };

  const handleInputChangePembelianKotor = (index, event) => {
    handleInputChangeHarga(index, event);
    const values = [...inputFields];
    if (event.target.name === "pembelian_kotor") {
      values[index]["pembelian_bersih"] =
        event.target.value - values[index]["pembelian_potongan"];
      //
      values[index]["pembelian_total"] =
        values[index]["pembelian_bersih"] * values[index]["pembelian_harga"];
    }
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  const handleInputChangePembelianPotongan = (index, event) => {
    const values = [...inputFields];
    if (event.target.name === "pembelian_potongan") {
      values[index]["pembelian_bersih"] =
        values[index]["pembelian_kotor"] - event.target.value;
      //
      values[index]["pembelian_total"] =
        values[index]["pembelian_bersih"] * values[index]["pembelian_harga"];
    }
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  const handleInputChangeHarga = (index, event) => {
    const values = [...inputFields];
    if (event.target.name === "pembelian_harga") {
      let ttl = values[index]["pembelian_bersih"] * event.target.value;
      values[index]["pembelian_total"] = ttl;
    }
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (suplier_nama === null) {
      alert("Nama Suplier harus diisi");
      return;
    }
    if (suplier_tgl === null) {
      alert("Tanggal harus diisi");
      return;
    }
    const toastId = toast.loading("Sending data...");
    try {
      const data = {
        pembelian_tgl: suplier_tgl,
        id: suplier_id,
        suplier_nama: suplier_nama,
      };
      const sanitizedFields = inputFields.map(item => ({
        ...item,
        barang_id: item.selectedBarang?.value === 'new'
          ? null
          : item.barang_id
      }));
      let params = {
        pembelian_id: id,
        formData: sanitizedFields,
        suplierData: data,
      };
      // console.log(params);
      const response = await api.post("/edit-Pembelian", params, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      // set null
      if (response.status === 200) {
        toast.update(toastId, {
          render: "Data update successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        onClose();
      } else {
        toast.update(toastId, {
          render: "Error updating data!" + response.status,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Error updating data! " + error.message,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      console.error("Error updating data:", error);
    }
  };

  let number = 0;

  const handleInputCheckbox = (index, event) => {
    const values = [...inputFields];
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-[1400px] h-full max-h-[95vh] rounded-2xl shadow-2xl relative z-10 flex flex-col font-poppins overflow-hidden">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-5 md:px-8 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
              <i className="fa fa-edit text-lg"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 leading-tight">Ubah Pembelian</h2>
              <p className="text-xs text-gray-500">Edit detail transaksi dan supplier</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <i className="fa fa-times text-lg"></i>
          </button>
        </div>

        {/* Form Wrap */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 md:px-8 bg-gray-50/30">
            
            {/* Info Suplier Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Suplier</label>
                <div className="relative">
                  <i className="fa fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed outline-none"
                    placeholder="Nama Suplier"
                    name="suplier_nama"
                    value={suplier_nama}
                    onChange={handleSuplier_nama}
                    disabled
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Tanggal Transaksi</label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                  name="suplier_tgl"
                  value={suplier_tgl}
                  onChange={handleSuplier_tgl}
                  required
                />
              </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-12">No</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-28">Tipe</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-48">Pilih Barang</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-40">Nama Barang</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-24">T. Kotor</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-24">Potongan</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-24">T. Bersih</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200 w-32">Harga</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-32">Pembayaran</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200 w-32">Subtotal</th>
                      <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center w-14">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inputFields.map((field, index) => {
                      number++;
                      return (
                        <tr key={index} className="hover:bg-teal-50/20 transition-colors">
                          <td className="py-2 px-2 text-center text-sm font-medium text-gray-500 border-r border-gray-100">{number}</td>
                          
                          <td className="py-2 px-3 border-r border-gray-100">
                            <select
                              className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all cursor-pointer"
                              name="barang_tipe"
                              value={field.barang_tipe}
                              onChange={(event) => handleInputChange(index, event)}
                            >
                              <option value="beras">Beras</option>
                              <option value="gabah">Gabah</option>
                            </select>
                          </td>
                          
                          <td className="py-2 px-3 border-r border-gray-100 relative">
                            <Select
                              value={field.selectedBarang}
                              onChange={(selected) => {
                                const values = [...inputFields];
                                values[index].selectedBarang = selected;
                                values[index].barang_id = selected && selected.value !== 'new' ? selected.value : null;
                                setInputFields(values);
                              }}
                              options={barangOptionsCache[field.barang_tipe] ? [...barangOptionsCache[field.barang_tipe], { value: 'new', label: '+ Barang Baru' }] : [{ value: 'new', label: '+ Barang Baru' }]}
                              placeholder="Cari..."
                              isClearable
                              menuPortalTarget={document.body}
                              styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                control: (base, state) => ({
                                  ...base,
                                  minHeight: '34px',
                                  fontSize: '13px',
                                  borderColor: state.isFocused ? '#2dd4bf' : '#e5e7eb', // teal-400 or gray-200
                                  boxShadow: state.isFocused ? '0 0 0 1px #2dd4bf' : 'none',
                                  borderRadius: '0.375rem',
                                  '&:hover': { borderColor: '#2dd4bf' }
                                })
                              }}
                            />
                          </td>
                          
                          <td className="py-2 px-3 border-r border-gray-100">
                            {field.selectedBarang && field.selectedBarang.value === 'new' ? (
                              <input
                                name="barang_nama"
                                className="w-full py-1.5 px-3 bg-white border border-teal-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                                placeholder="Ketik nama..."
                                value={field.barang_nama}
                                onChange={(event) => handleInputChange(index, event)}
                                required
                              />
                            ) : (
                              <span className="text-xs text-gray-400 italic bg-gray-50 px-2 py-1 rounded w-full block border border-gray-100 text-center">Otomatis dari sistem</span>
                            )}
                          </td>
                          
                          <td className="py-2 px-3 border-r border-gray-100">
                            <input
                              type="number"
                              className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-center text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                              name="pembelian_kotor"
                              value={field.pembelian_kotor}
                              onChange={(event) => handleInputChangePembelianKotor(index, event)}
                              required
                              onFocus={(e) => e.target.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                            />
                          </td>
                          
                          <td className="py-2 px-3 border-r border-gray-100">
                            <input
                              type="number"
                              className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-center text-red-600 font-medium focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all"
                              name="pembelian_potongan"
                              value={field.pembelian_potongan}
                              onChange={(event) => handleInputChangePembelianPotongan(index, event)}
                              onFocus={(e) => e.target.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                            />
                          </td>
                          
                          <td className="py-2 px-3 border-r border-gray-100">
                            <input
                              className="w-full py-1.5 px-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-center text-green-700 font-bold cursor-not-allowed outline-none"
                              name="pembelian_bersih"
                              value={field.pembelian_bersih}
                              readOnly
                              required
                            />
                          </td>
                          
                          <td className="py-2 px-3 border-r border-gray-100">
                            <input
                              type="number"
                              className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-right text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                              name="pembelian_harga"
                              value={field.pembelian_harga}
                              onChange={(event) => handleInputChangeHarga(index, event)}
                              required
                              onFocus={(e) => e.target.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                            />
                          </td>
                          
                          <td className="py-2 px-3 border-r border-gray-100">
                            <div className="flex justify-center gap-3">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                                  name="pembayaran"
                                  value="cash"
                                  onChange={(event) => handleInputCheckbox(index, event)}
                                  checked={field.pembayaran === "cash"}
                                  required={field.pembayaran === ""}
                                />
                                <span className={`text-[11px] font-bold uppercase tracking-wide ${field.pembayaran === 'cash' ? 'text-green-600' : 'text-gray-500'}`}>Cash</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                                  name="pembayaran"
                                  value="hutang"
                                  onChange={(event) => handleInputCheckbox(index, event)}
                                  checked={field.pembayaran === "hutang"}
                                  required={field.pembayaran === ""}
                                />
                                <span className={`text-[11px] font-bold uppercase tracking-wide ${field.pembayaran === 'hutang' ? 'text-red-500' : 'text-gray-500'}`}>Hutang</span>
                              </label>
                            </div>
                          </td>
                          
                          <td className="py-2 px-3 border-r border-gray-100">
                            <input
                              type="text"
                              className="w-full py-1.5 px-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-right text-gray-800 font-bold cursor-not-allowed outline-none"
                              name="pembelian_total"
                              value={RupiahFormat(field.pembelian_total)}
                              readOnly
                              required
                            />
                          </td>
                          
                          <td className="py-2 px-2 text-center">
                            {number === 1 ? (
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
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tambah Baris Button - Diletakkan di bawah tabel sedikit agar scrollable */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddField}
                className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors shadow-sm"
              >
                <i className="fa fa-plus text-xs"></i> Tambah Baris
              </button>
            </div>
            
          </div>

          {/* Footer Modal (Fixed di Bawah) */}
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

export default ModalEditPembelian;