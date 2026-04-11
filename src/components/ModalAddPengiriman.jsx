import React, { useState } from "react";
import axios from "axios";
import RupiahFormat from "../utilities/RupiahFormat";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ModalAddPengiriman({ isOpen, onClose }) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <ToastContainer />
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="bg-white w-3/4 h-[98%] p-6 rounded-lg shadow-lg relative z-10">
        <div className="w-full h-[8%]">
          <h2 className="text-xl font-semibold mb-2 text-colorBlue font-poppins">
            Tambah Pengiriman
          </h2>
          <div className="h-[2px] w-full bg-colorBlue mb-4"></div>
        </div>
        <div className="w-full h-[85%]  overflow-auto">
          <form onSubmit={handleSubmit}>
            <div className="flex font-poppins items-center my-2">
              <p className="w-52">Tanggal Pengiriman</p>
              <p>:</p>
              <input
                type="date"
                className="border ml-5 w-full p-2"
                placeholder="Nama Suplier"
                name="pengiriman_tgl"
                value={pengiriman_tgl}
                onChange={handlePengiriman_tgl}
                required
              ></input>
            </div>
            <div className="h-[65%]">
              {/* <div className="flex-row"></div> */}
              {inputFields.map((field, index) => (
                <div className="w-full">
                  <div className="border my-1">
                    <div className="flex items-center">
                      <h3 className="py-1 px-2 w-[50%]">Merek</h3>
                      <p className="w-[1%]">:</p>
                      <input
                        required
                        name="data_merek"
                        className="border m-2 w-[50%] p-1"
                        value={field.data_merek}
                        onChange={(event) => handleInputChange(index, event)}
                      ></input>
                    </div>
                  </div>
                  <div className="border my-1">
                    <div className="flex items-center">
                      <h3 className="py-1 px-2 w-[50%]">Nama Barang</h3>
                      <p className="w-[1%]">:</p>
                      <input
                        required
                        name="data_barang"
                        className="border m-2 w-[50%] p-1"
                        value={field.data_barang}
                        onChange={(event) => handleInputChange(index, event)}
                      ></input>
                    </div>
                  </div>
                  <div className="border my-1">
                    <div className="flex items-center">
                      <h3 className="py-1 px-2 w-[50%]">Tonase</h3>
                      <p className="w-[1%]">:</p>
                      <input
                        type="number"
                        className="border m-2 w-[50%] p-1"
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
                    </div>
                  </div>
                  <div className="border my-1">
                    <div className="flex items-center">
                      <h3 className="py-1 px-2 w-[50%]">Harga</h3>
                      <p className="w-[1%]">:</p>
                      <input
                        type="number"
                        className="border m-2 w-[50%] p-1"
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
                    </div>
                  </div>
                  <div className="border my-1">
                    <div className="flex items-center">
                      <h3 className="py-1 px-2 w-[50%]">Total</h3>
                      <p className="w-[1%]">:</p>
                      <input
                        type="text"
                        className="border m-2 w-[50%] p-1 bg-slate-300"
                        name="data_total"
                        value={RupiahFormat(field.data_total)}
                        readOnly
                        required
                      ></input>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button
                      className="bg-green-700 text-colorGray py-1 px-2 rounded-md my-1"
                      type="button"
                      onClick={() => handleAddField()}
                    >
                      <i className="fa fa-plus"></i> Tambah
                    </button>
                    <button
                      className={`${
                        inputFields.length === 1 ? "hidden" : ""
                      } bg-red-600 text-colorGray py-1 px-2 rounded-md my-2`}
                      type="button"
                      onClick={() => handleRemoveField(index)}
                    >
                      <i className="fa fa-trash"></i> Hapus
                    </button>
                  </div>

                  <div className="h-1 w-full bg-colorBlue"></div>
                </div>
              ))}
              <button
                className="mt-5 px-4 py-2 bg-colorBlue font-poppins text-colorGray rounded hover:bg-blue-900"
                type="submit"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
        <div className="w-full h-[7%]">
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

export default ModalAddPengiriman;
