import React, { useState, useEffect } from "react";
import axios from "axios";
import RupiahFormat from "../utilities/RupiahFormat";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utilities/axiosInterceptor";

function ModalEditPengiriman({ pengiriman_id, isOpen, onClose }) {
  // TOKEN
  const token = localStorage.getItem("token");
  //
  const [inputFieldsPengiriman, setInputFieldsPengiriman] = useState([]);
  const [boxHarga, setBoxHarga] = useState([]);

  //
  useEffect(() => {
    const toastId = toast.loading("Getting data...");
    const fectData = async () => {
      //fetching
      const response = await api.get(`/detail-Pengiriman/${pengiriman_id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
        },
      });
      // console.log(response.status);
      if (response.status === 200) {
        //get response data
        const data = await response.data.data.listPembelian;
        //assign response data to state "posts"
        setInputFieldsPengiriman(data);
        const suplier = await response.data.data;
        setPengiriman_tgl(suplier.pengiriman_tgl);
        // data box harga
        const responseBox = await api.get("/detail-Kardus/1", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        const harga = await responseBox.data.data.harga;
        setBoxHarga(harga);
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
  }, [pengiriman_id]);
  //
  const [pengiriman_tgl, setPengiriman_tgl] = useState(null);
  const handlePengiriman_tgl = (event) => {
    setPengiriman_tgl(event.target.value);
  };

  const handleAddField = () => {
    setInputFieldsPengiriman([
      ...inputFieldsPengiriman,
      {
        data_merek: "",
        data_barang: "",
        data_box: "",
        data_box_harga: boxHarga,
        data_box_rupiah: "",
        data_tonase: "",
        data_datas: "",
        data_estimasi: "",
        data_harga: "",
        data_total: "",
        data_st: "",
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
    values[index][event.target.name] = event.target.value;
    setInputFieldsPengiriman(values);
  };

  const handleInputTonase = (index, event) => {
    console.log("tonase");
    const values = [...inputFieldsPengiriman];
    if (event.target.name === "data_tonase") {
      values[index]["data_harga"] =
        values[index]["data_total"] / event.target.value;
      //
      values[index]["data_datas"] =
        values[index]["data_estimasi"] / event.target.value;
    }
    values[index][event.target.name] = event.target.value;
    setInputFieldsPengiriman(values);
  };

  const handleInputChangeHarga = (index, event) => {
    const values = [...inputFieldsPengiriman];
    let input = event.target.value.replace(/\./g, "");
    if (/^\d*$/.test(input)) {
      if (event.target.name === "data_harga") {
        let total = input * values[index]["data_tonase"];
        values[index]["data_total"] = total;
      }
      values[index][event.target.name] = input;
      setInputFieldsPengiriman(values);
    }
  };

  const handleInputChangeHargaEstimasi = (index, event) => {
    const values = [...inputFieldsPengiriman];
    let input = event.target.value.replace(/\./g, "");
    if (/^\d*$/.test(input)) {
      if (event.target.name === "data_datas") {
        let total = input * values[index]["data_tonase"];
        values[index]["data_estimasi"] = total;
      }
      values[index][event.target.name] = input;
      setInputFieldsPengiriman(values);
    }
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("id-ID").format(number);
  };

  const handleInputChangeTotal = (index, event) => {
    const values = [...inputFieldsPengiriman];
    let input = event.target.value.replace(/\./g, "");
    if (/^\d*$/.test(input)) {
      if (event.target.name === "data_total") {
        let res = Number(input) / values[index]["data_tonase"];
        let harga = Math.round(res * 100) / 100;
        values[index]["data_harga"] = harga;
      }
      values[index][event.target.name] = input;
      setInputFieldsPengiriman(values);
    }
  };

  const handleInputChangeTotalEstimasi = (index, event) => {
    const values = [...inputFieldsPengiriman];
    let input = event.target.value.replace(/\./g, "");
    if (/^\d*$/.test(input)) {
      if (event.target.name === "data_estimasi") {
        let res = Number(input) / values[index]["data_tonase"];
        let harga = Math.round(res * 100) / 100;
        values[index]["data_datas"] = harga;
      }
      values[index][event.target.name] = input;
      setInputFieldsPengiriman(values);
    }
  };

  const handleInputKardus = (index, event) => {
    //
    const values = [...inputFieldsPengiriman];
    values[index]["data_box_rupiah"] =
      values[index]["data_box_harga"] * event.target.value;
    values[index][event.target.name] = event.target.value;
    setInputFieldsPengiriman(values);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const toastId = toast.loading("Sending data...");
    try {
      const data = {
        pengiriman_id: pengiriman_id,
        pengiriman_tgl: pengiriman_tgl,
      };
      let params = {
        formData: inputFieldsPengiriman,
        pengirimanData: data,
      };
      console.log(params);
      const response = await api.post("/edit-Pengiriman", params, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      // set null
      console.log("Response:", response.status);
      if (response.status === 200) {
        // setPengiriman_tgl("");
        // setInputFieldsPengiriman([
        //   {
        //     data_merek: "",
        //     data_barang: "",
        //     data_tonase: "",
        //     data_harga: "",
        //     data_total: "",
        //   },
        // ]);
        //
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
    // console.log("inputFieldsPengiriman:", inputFieldsPengiriman);
  };

  let number = 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="bg-white w-[85%] h-[98%] p-6 rounded-lg shadow-lg relative z-10">
        <div className="w-full max-h-fit  overflow-auto">
          <form onSubmit={handleSubmit} className="h-[90%] overflow-y-auto">
            <div className="flex font-poppins items-center my-2">
              <p className="w-fit">Pengiriman : </p>
              <input
                type="date"
                className="border ml-5 w-1/2 p-2"
                placeholder="Nama Suplier"
                name="pengiriman_tgl"
                value={pengiriman_tgl}
                onChange={handlePengiriman_tgl}
                required
              ></input>
            </div>
            <div className="overflow-x-auto">
              <table className="w-[120%] xl:w-full font-poppins text-xs xl:text-md">
                <thead>
                  <tr className="w-full text-black text-center font-poppins text-xs xl:text-md bg-colorBlue">
                    <th className="border border-black md:w-[3%]">No</th>
                    <th className="border border-black md:w-[10%]">Merek</th>
                    <th className="border border-black md:w-[10%]">
                      Nama Barang
                    </th>
                    <th className="border border-black md:w-[5%]">Pax</th>
                    <th className="border border-black md:w-[8%]">Harga Pax</th>
                    <th className="border border-black md:w-[10%]">Ttl Pax</th>
                    <th className="border border-black md:w-[5%]">Tonase</th>
                    <th className="border border-black md:w-[10%] bg-yellow-300">
                      Harga Esti
                    </th>
                    <th className="border border-black md:w-[10%] bg-yellow-300">
                      Total Esti
                    </th>
                    <th className="border border-black md:w-[10%] bg-green-300">
                      Harga Real
                    </th>
                    <th className="border border-black md:w-[10%] bg-green-300">
                      Total Real
                    </th>
                    <td className="border border-black md:w-[8%]">Status</td>
                    <td className="border border-black md:w-[5%]"></td>
                  </tr>
                </thead>

                {inputFieldsPengiriman.map((field, index) => {
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
                        <input
                          required
                          name="data_merek"
                          className="border m-2 w-24 md:w-3/4 p-1"
                          value={field.data_merek}
                          onChange={(event) => handleInputChange(index, event)}
                        ></input>
                      </td>
                      <td className="border border-black">
                        <input
                          className="border m-2 w-24 md:w-3/4 p-1"
                          name="data_barang"
                          value={field.data_barang}
                          onChange={(event) => handleInputChange(index, event)}
                          required
                        ></input>
                      </td>
                      <td className="border border-black">
                        <input
                          type="number"
                          className="border m-2 w-24 md:w-3/4 p-1"
                          name="data_box"
                          value={field.data_box}
                          onChange={(event) => handleInputKardus(index, event)}
                          required
                        ></input>
                      </td>
                      <td className="border border-black">
                        <input
                          readOnly
                          type="number"
                          className="border m-2 w-24 md:w-3/4 p-1 bg-slate-300"
                          name="data_box_harga"
                          value={formatNumber(field.data_box_harga)}
                          onChange={(event) => handleInputChange(index, event)}
                        ></input>
                      </td>
                      <td className="border border-black">
                        <input
                          type="number"
                          className="border m-2 w-24 md:w-3/4 p-1 bg-slate-300"
                          name="data_box_rupiah"
                          value={formatNumber(field.data_box_rupiah)}
                          onChange={(event) => handleInputChange(index, event)}
                          readOnly
                          required
                        ></input>
                      </td>
                      <td className="border border-black">
                        <input
                          className="border m-2 w-24 md:w-3/4 p-1"
                          name="data_tonase"
                          value={field.data_tonase}
                          onChange={(event) => handleInputTonase(index, event)}
                          required
                        ></input>
                      </td>
                      <td className="border border-black bg-yellow-300">
                        <input
                          type="text"
                          className="border m-2 w-24 md:w-3/4 p-1"
                          name="data_datas"
                          value={formatNumber(field.data_datas)}
                          onChange={(event) =>
                            handleInputChangeHargaEstimasi(index, event)
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
                      <td className="border border-black bg-yellow-300">
                        <input
                          type="text"
                          className="border m-2 w-24 md:w-3/4 "
                          name="data_estimasi"
                          value={formatNumber(field.data_estimasi)}
                          onChange={(event) =>
                            handleInputChangeTotalEstimasi(index, event)
                          }
                          required
                        ></input>
                      </td>
                      <td className="border border-black bg-green-300">
                        <input
                          type="text"
                          className="border m-2 w-24 md:w-3/4 p-1"
                          name="data_harga"
                          value={formatNumber(field.data_harga)}
                          onChange={(event) =>
                            handleInputChangeHarga(index, event)
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
                      <td className="border border-black bg-green-300">
                        <input
                          type="text"
                          className="border m-2 w-24 md:w-3/4"
                          name="data_total"
                          value={formatNumber(field.data_total)}
                          onChange={(event) =>
                            handleInputChangeTotal(index, event)
                          }
                          required
                        ></input>
                      </td>
                      <td className="border border-black">
                        <div className="flex gap-3 w-3/4 mx-auto">
                          <div>
                            <p className="text-xs font-poppins">BYR</p>
                            <input
                              type="checkbox"
                              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
                              name="data_st"
                              value="yes"
                              onChange={(event) =>
                                handleInputChange(index, event)
                              }
                              checked={field.data_st === "yes"}
                              // required={field.pembayaran === ""}
                            ></input>
                          </div>
                          <div>
                            <p className="text-xs font-poppins">HTG</p>
                            <input
                              type="checkbox"
                              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
                              name="data_st"
                              value="no"
                              onChange={(event) =>
                                handleInputChange(index, event)
                              }
                              checked={field.data_st === "no"}
                              // required={field.pembayaran === ""}
                            ></input>
                          </div>
                        </div>
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
              </table>
            </div>
            <div className="w-full text-right mt-3">
              <button
                className="py-1 px-2 text-xs xl:text-md bg-green-700 font-poppins text-colorGray rounded hover:bg-green-900"
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
            <i className="fa fa-plus "></i> Tambah
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

export default ModalEditPengiriman;
