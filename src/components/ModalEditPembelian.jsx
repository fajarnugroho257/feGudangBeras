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

  //   console.log(datas);

  // console.log(inputFields);
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
      // console.log("Response:", response.status);
      if (response.status === 200) {
        //
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
    // console.log("inputFields:", inputFields);
  };

  let number = 0;

  const handleInputCheckbox = (index, event) => {
    const values = [...inputFields];
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="bg-white w-[88%] h-[98%] p-6 rounded-lg shadow-lg relative z-10">
        <div className="w-full h-fit">
          <h2 className="text-md xl:text-xl font-semibold mb-1 xl:mb-2 text-colorBlue font-poppins">
            Ubah Pembelian
          </h2>
          <div className="h-[1px] xl:h-[2px] w-full bg-colorBlue mb-1 xl:mb-3"></div>
        </div>
        <div className="w-full h-fit overflow-auto">
          <form onSubmit={handleSubmit} className="h-fit overflow-y-auto">
            <div className="md:grid md:grid-cols-2 md:gap-5 md:mb-2">
              <div className="text-sm xl:text-md flex font-poppins items-center my-2">
                <p className="w-fit">Nama Suplier : </p>
                <input
                  className="border ml-5 w-1/2  p-2 bg-gray-100"
                  placeholder="Nama Suplier"
                  name="suplier_nama"
                  value={suplier_nama}
                  onChange={handleSuplier_nama}
                  disabled
                ></input>
              </div>
              <div className="text-sm xl:text-md flex font-poppins items-center my-2">
                <p className="w-fit">Tanggal : </p>
                <input
                  type="date"
                  className="border ml-5 w-1/2 p-2"
                  placeholder="Nama Suplier"
                  name="suplier_tgl"
                  value={suplier_tgl}
                  onChange={handleSuplier_tgl}
                  required
                ></input>
              </div>
            </div>

            <div className="overflow-x-auto" key="table-edit">
              <table className="w-[115%] xl:w-full font-poppins text-xs xl:text-md">
                <thead>
                  <tr className="w-full text-white text-center font-poppins text-xs xl:text-md bg-colorBlue">
                    <th className="border border-black md:w-[5%]">No</th>
                    <th className="border border-black md:w-[8%]">Tipe</th>
                    <th className="border border-black md:w-[15%]">Pilih Barang</th>
                    <th className="border border-black md:w-[15%]">Nama Barang</th>
                    <th className="border border-black md:w-[9%]">
                      Tonase Kotor
                    </th>
                    <th className="border border-black md:w-[9%]">Potongan</th>
                    <th className="border border-black md:w-[9%]">
                      Tonase Bersih
                    </th>
                    <th className="border border-black md:w-[12%]">Harga</th>
                    <th className="border border-black md:w-[12%]">
                      Pembayaran
                    </th>
                    <th className="border border-black md:w-[12%]">Total</th>
                    <th className="border border-black md:w-[9%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {inputFields.map((field, index) => {
                    number++;
                    return (
                      <tr
                        key={index}
                        className={`text-center hover:bg-colorBlue  ${
                          number % 2 === 0 ? "bg-gray-50" : "bg-gray-200"
                        }`}
                      >
                        <td className="border border-black">{number}</td>
                        <td className="border border-black">
                          <div className="m-1">
                            <select
                              className="border w-full p-1"
                              name="barang_tipe"
                              value={field.barang_tipe}
                              onChange={(event) => handleInputChange(index, event)}
                            >
                              <option value="beras">Beras</option>
                              <option value="gabah">Gabah</option>
                            </select>
                          </div>
                        </td>
                        <td className="border border-black">
                          <div className="p-1">
                            <Select
                              value={field.selectedBarang}
                              onChange={(selected) => {
                                const values = [...inputFields];
                                values[index].selectedBarang = selected;
                                values[index].barang_id =
                                  selected && selected.value !== 'new' ? selected.value : null;
                                setInputFields(values);
                              }}
                              options={barangOptionsCache[field.barang_tipe] ? [...barangOptionsCache[field.barang_tipe], { value: 'new', label: 'Barang Baru' }] : [{ value: 'new', label: 'Barang Baru' }]}
                              placeholder="Cari..."
                              isClearable
                              menuPortalTarget={document.body}
                              styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                control: (base) => ({ ...base, minHeight: '30px', fontSize: '12px' })
                              }}
                            />
                          </div>
                        </td>
                        <td className="border border-black">
                          {field.selectedBarang && field.selectedBarang.value === 'new' ? (
                            <input
                              name="barang_nama"
                              className="border p-1 w-11/12"
                              placeholder="Nama Baru"
                              value={field.barang_nama}
                              onChange={(event) => handleInputChange(index, event)}
                              required
                            />
                          ) : (
                            <span className="text-gray-400 italic">Otomatis</span>
                          )}
                        </td>
                        <td className="border border-black">
                          <input
                            type="number"
                            className="border m-2 w-24 md:w-3/4 p-1"
                            name="pembelian_kotor"
                            value={field.pembelian_kotor}
                            onChange={(event) =>
                              handleInputChangePembelianKotor(index, event)
                            }
                            required
                            onFocus={(e) =>
                              e.target.addEventListener(
                                "wheel",
                                function (e) {
                                  e.preventDefault();
                                },
                                { passive: false },
                              )
                            }
                          ></input>
                        </td>
                        <td className="border border-black">
                          <input
                            type="number"
                            className="border m-2 w-24 md:w-3/4 p-1"
                            name="pembelian_potongan"
                            value={field.pembelian_potongan}
                            onChange={(event) =>
                              handleInputChangePembelianPotongan(index, event)
                            }
                            onFocus={(e) =>
                              e.target.addEventListener(
                                "wheel",
                                function (e) {
                                  e.preventDefault();
                                },
                                { passive: false },
                              )
                            }
                          ></input>
                        </td>
                        <td className="border border-black">
                          <input
                            className="border m-2 w-24 md:w-3/4 p-1 bg-slate-300"
                            name="pembelian_bersih"
                            value={field.pembelian_bersih}
                            readOnly
                            required
                          ></input>
                        </td>
                        <td className="border border-black">
                          <input
                            type="number"
                            className="border m-2 w-24 md:w-3/4 p-1"
                            name="pembelian_harga"
                            value={field.pembelian_harga}
                            onChange={(event) =>
                              handleInputChangeHarga(index, event)
                            }
                            onFocus={(e) =>
                              e.target.addEventListener(
                                "wheel",
                                function (e) {
                                  e.preventDefault();
                                },
                                { passive: false },
                              )
                            }
                            required
                          ></input>
                        </td>
                        <td className="border border-black">
                          <div className="flex gap-3 w-3/4 mx-auto">
                            <div>
                              <p className="text-xs font-poppins">Cash</p>
                              <input
                                type="checkbox"
                                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
                                name="pembayaran"
                                value="cash"
                                onChange={(event) =>
                                  handleInputCheckbox(index, event)
                                }
                                checked={field.pembayaran === "cash"}
                                required={field.pembayaran === ""}
                              ></input>
                            </div>
                            <div>
                              <p className="text-xs font-poppins">Hutang</p>
                              <input
                                type="checkbox"
                                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
                                name="pembayaran"
                                value="hutang"
                                onChange={(event) =>
                                  handleInputCheckbox(index, event)
                                }
                                checked={field.pembayaran === "hutang"}
                                required={field.pembayaran === ""}
                              ></input>
                            </div>
                          </div>
                        </td>
                        <td className="border border-black">
                          <input
                            type="text"
                            className="border m-2 w-24 md:w-3/4 bg-slate-300"
                            name="pembelian_total"
                            value={RupiahFormat(field.pembelian_total)}
                            readOnly
                            required
                          ></input>
                        </td>
                        <td className="border border-black">
                          {number === 1 ? (
                            <button
                              className={` bg-red-400 text-colorGray py-1 px-2 rounded-md my-2 font-sm md:font-normal`}
                              type="button"
                              disabled
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          ) : (
                            <button
                              className={` bg-red-600 text-colorGray py-1 px-2 rounded-md my-2 font-sm md:font-normal`}
                              type="button"
                              onClick={() => handleRemoveField(index)}
                            >
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
            <div className="w-full text-right mt-2">
              <button
                className=" py-1 px-2 text-xs xl:text-md bg-green-700 font-poppins text-colorGray rounded hover:bg-green-900"
                type="submit"
              >
                <i className="fa fa-save"></i> Simpan
              </button>
            </div>
          </form>
        </div>
        <div className="h-fit">
          <button
            className="bg-colorBlue text-colorGray py-1 px-2 rounded-sm my-1 font-poppins text-xs xl:text-md"
            type="button"
            onClick={() => handleAddField()}
          >
            <i className="fa fa-plus"></i> Tambah
          </button>
        </div>
        <div className="w-full h-fit">
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-colorGray border-2 border-colorBlue font-poppins text-colorBlue rounded hover:bg-slate-200"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalEditPembelian;
