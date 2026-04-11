import React, { useState } from "react";
import axios from "axios";
import RupiahFormat from "../utilities/RupiahFormat";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Tambah() {
  const [pengiriman_tgl, setPengiriman_tgl] = useState(null);
  //
  const handlePengiriman_tgl = (event) => {
    setPengiriman_tgl(event.target.value);
  };

  const [inputFields, setInputFields] = useState([
    {
      data_merek: "",
      data_barang: "",
      data_tonase: "",
      data_harga: "",
      data_total: "",
    },
  ]);

  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      {
        data_merek: "",
        data_barang: "",
        data_tonase: "",
        data_harga: "",
        data_total: "",
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
    setInputFields(values);
  };

  const handleInputTonase = (index, event) => {
    console.log("tonase");
    const values = [...inputFields];
    if (event.target.name === "data_tonase") {
      values[index]["data_total"] =
        event.target.value * values[index]["data_harga"];
    }
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  const handleInputChangeHarga = (index, event) => {
    const values = [...inputFields];
    if (event.target.name === "data_harga") {
      values[index]["data_total"] =
        event.target.value * values[index]["data_tonase"];
    }
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const toastId = toast.loading("Sending data...");
    try {
      const data = { pengiriman_tgl: pengiriman_tgl };
      let params = {
        formData: inputFields,
        pengirimanData: data,
      };
      console.log(params);
      const response = await axios.post(
        "https://demoapps.online/be/index.php/api/add-Pengiriman",
        params,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      // set null
      console.log("Response:", response.status);
      if (response.status === 200) {
        setPengiriman_tgl("");
        setInputFields([
          {
            data_merek: "",
            data_barang: "",
            data_tonase: "",
            data_harga: "",
            data_total: "",
          },
        ]);
        //
        toast.update(toastId, {
          render: "Data sent successfully!",
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
    } catch (error) {
      toast.update(toastId, {
        render: "Error sending data! " + error.message,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      console.error("Error posting data:", error);
    }
    // console.log("inputFields:", inputFields);
  };
  //
  return (
    <div className="px-0 py-1 md:px-5 md:py-3 h-[86%] flex items-center">
      <div className=" w-full h-full md:w-[80%] md:h-[90%] mx-auto bg-gray-50 shadow-xl p-10 rounded-md">
        <div className="h-[20%] md:h-[5%] md:flex items-center mb-5 justify-between">
          <div className="font-poppins font-semibold flex gap-4">
            <h3 className="text-colorBlue">Pembelian</h3>
            <h3 className="text-gray-500">Pengiriman</h3>
          </div>
        </div>
        <div className="h-[2px] w-full bg-colorBlue mb-4"></div>
        <div className="h-[70%] md:h-[95%] overflow-x-scroll">
          <div className="w-full h-ful  overflow-auto">
            <form onSubmit={handleSubmit}>
              <div className="flex font-poppins items-center my-2">
                <p className="w-52">Tanggal Pengiriman</p>
                <p>:</p>
                <input
                  type="date"
                  className="border ml-5 w-1/4 p-2"
                  placeholder="Nama Suplier"
                  name="pengiriman_tgl"
                  value={pengiriman_tgl}
                  onChange={handlePengiriman_tgl}
                  required
                ></input>
              </div>
              <table className="w-full">
                <tr>
                  <td className="border border-black">Merek</td>
                  <td className="border border-black">Nama Barang</td>
                  <td className="border border-black">Tonase</td>
                  <td className="border border-black">Harga</td>
                  <td className="border border-black">Total</td>
                  <td className="border border-black"></td>
                </tr>
                {inputFields.map((field, index) => (
                  <tr>
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
                        required
                        name="data_barang"
                        className="border m-2 w-24 md:w-3/4 p-1"
                        value={field.data_barang}
                        onChange={(event) => handleInputChange(index, event)}
                      ></input>
                    </td>
                    <td className="border border-black">
                      <input
                        type="number"
                        className="border m-2 w-24 md:w-3/4 p-1"
                        name="data_tonase"
                        value={field.data_tonase}
                        onChange={(event) => handleInputTonase(index, event)}
                        required
                        onFocus={(e) =>
                          e.target.addEventListener(
                            "wheel",
                            function (e) {
                              e.preventDefault();
                            },
                            { passive: false }
                          )
                        }
                      ></input>
                    </td>
                    <td className="border border-black">
                      <input
                        type="number"
                        className="border m-2 w-24 md:w-3/4 p-1"
                        name="data_harga"
                        value={field.data_harga}
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
                            { passive: false }
                          )
                        }
                      ></input>
                    </td>
                    <td className="border border-black">
                      <input
                        type="text"
                        className="border m-2 w-24 md:w-3/4 p-1 bg-slate-300"
                        name="data_total"
                        value={RupiahFormat(field.data_total)}
                        readOnly
                        required
                      ></input>
                    </td>
                    <td className="border border-black">
                      <button
                        className={`${
                          inputFields.length === 1 ? "hidden" : ""
                        } bg-red-600 text-colorGray py-1 px-2 rounded-md my-2`}
                        type="button"
                        onClick={() => handleRemoveField(index)}
                      >
                        <i className="fa fa-trash"></i> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                <button
                  className="bg-green-700 text-colorGray py-1 px-2 rounded-md my-1"
                  type="button"
                  onClick={() => handleAddField()}
                >
                  <i className="fa fa-plus"></i> Tambah
                </button>
                <button
                  className="mt-5 px-4 py-2 bg-colorBlue font-poppins text-colorGray rounded hover:bg-blue-900"
                  type="submit"
                >
                  Submit
                </button>
              </table>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Tambah;
