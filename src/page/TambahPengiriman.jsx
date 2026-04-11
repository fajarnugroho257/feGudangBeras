import React, { useState, useEffect } from "react";
import RupiahFormat from "../utilities/RupiahFormat";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import api from "../utilities/axiosInterceptor";

function TambahPengiriman() {
  // TOKEN
  const token = localStorage.getItem("token");
  //
  const [pengiriman_tgl, setPengiriman_tgl] = useState(null);
  const [boxHarga, setBoxHarga] = useState(null);
  const [boxJumlah, setBoxJumlah] = useState(0);
  //
  const handlePengiriman_tgl = (event) => {
    setPengiriman_tgl(event.target.value);
  };

  const [inputFields, setInputFields] = useState([]);

  useEffect(() => {
    const fectData = async () => {
      //fetching
      const response = await api.get("/detail-Kardus/1", {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      //get response data
      const harga = await response.data.data.harga;
      const jumlah = await response.data.data.jumlah;
      // console.log(harga);
      //
      if (response.status === 200) {
        setInputFields([
          ...inputFields,
          {
            data_merek: "",
            data_barang: "",
            data_box: "",
            data_box_harga: harga,
            data_box_rupiah: "",
            data_tonase: "",
            data_datas: "",
            data_estimasi: "",
          },
        ]);
      }
      //assign response data to state "posts"
      setBoxHarga(harga);
      setBoxJumlah(jumlah);
    };
    fectData();
  }, []);
  //

  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      {
        data_merek: "",
        data_barang: "",
        data_box: "",
        data_box_harga: boxHarga,
        data_box_rupiah: "",
        data_tonase: "",
        data_datas: "",
        data_estimasi: "",
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
    const values = [...inputFields];
    if (event.target.name === "data_tonase") {
      values[index]["data_estimasi"] =
        event.target.value * values[index]["data_datas"];
    }
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  const handleInputChangeHarga = (index, event) => {
    const values = [...inputFields];
    if (event.target.name === "data_datas") {
      values[index]["data_estimasi"] =
        event.target.value * values[index]["data_tonase"];
    }
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  const handleInputKardus = (index, event) => {
    //
    const values = [...inputFields];
    values[index]["data_box_rupiah"] = boxHarga * event.target.value;
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  const navigate = useNavigate();
  const handleTab = (event) => {
    navigate(`/${event}`);
  };

  const handleSubmit = async (event, totalDataBox) => {
    const btnValue = event.nativeEvent.submitter.value; // Mendapatkan nilai button yang di-klik
    event.preventDefault();
    const toastId = toast.loading("Sending data...");
    try {
      // console.log(inputFields);
      const data = { pengiriman_tgl: pengiriman_tgl };
      let params = {
        formData: inputFields,
        pengirimanData: data,
        type: btnValue,
      };
      let response = "";
      if (btnValue === "simcetak") {
        response = await api.post(`/add-Pengiriman`, params, {
          headers: {
            Authorization: `Bearer ${token}`, // Sisipkan token di header
          },
          responseType: "blob", // penting untuk men-download file
        });
        // console.log(response.data);
        // Membuat URL untuk file yang didownload
        const url = window.URL.createObjectURL(new Blob([response.data]));
        // alert(url);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "Pembelian.png"); // Nama file untuk diunduh
        document.body.appendChild(link);
        link.click(); // Memicu download
        document.body.removeChild(link); // Menghapus link setelah download
      } else {
        response = await api.post("/add-Pengiriman", params, {
          headers: {
            Authorization: `Bearer ${token}`, // Sisipkan token di header
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
      }
      // set null
      // console.log("Response:", response.status);
      if (response.status === 200) {
        setPengiriman_tgl("");
        setInputFields([
          {
            data_merek: "",
            data_barang: "",
            data_box: "",
            data_tonase: "",
            data_datas: "",
            data_estimasi: "",
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

  let [number] = useState(1);
  //
  return (
    <div className="p-1 md:p-2 xl:p-7">
      <div className=" w-full h-full mx-auto bg-gray-50 shadow-xl p-5">
        <div className="h-fit xl:flex items-center mb-1 xl:mb-4 justify-between">
          <div className="font-poppins font-normal grid grid-cols-2 md:flex gap-1 xl:gap-4 items-center">
            <h3
              className="text-gray-500 text-xs xl:text-md cursor-pointer border-l-2 px-2"
              onClick={() => handleTab("tambah-pembelian")}
            >
              Pembelian
            </h3>
            <h3 className="text-colorBlue text-sm xl:text-lg font-bold border-l-2 px-2">
              Pengiriman
            </h3>
            <h3
              className="text-gray-500 text-xs xl:text-md cursor-pointer border-l-2 px-2"
              onClick={() => handleTab("tambah-karyawan")}
            >
              Karyawan
            </h3>
            <h3
              className="text-gray-500 text-xs xl:text-md cursor-pointer border-l-2 px-2"
              onClick={() => handleTab("tambah-kardus")}
            >
              Kardus
            </h3>
          </div>
        </div>
        <div className="h-[1px] xl:h-[2px] w-full bg-colorBlue mb-2 xl:mb-4"></div>
        <div className="h-fit">
          <form onSubmit={handleSubmit} className="h-fit overflow-y-auto">
            <div className="md:grid md:grid-cols-2 md:gap-10 md:mb-0">
              <div className="flex text-sm xl:text-md font-poppins items-center my-2">
                <p className="w-fit">Pengiriman : </p>
                <input
                  type="date"
                  className="border ml-5 px-2 py-1 w-1/2"
                  placeholder="Nama Suplier"
                  name="pengiriman_tgl"
                  value={pengiriman_tgl}
                  onChange={handlePengiriman_tgl}
                  required
                ></input>
              </div>
              <div className="flex text-sm xl:text-md font-poppins items-center my-2">
                <p className="w-fit">Sisa Kardus : </p>
                <p className="ml-5 w-full md:w-1/4 p-2">{boxJumlah}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-[110%] xl:w-full font-poppins text-xs xl:text-md">
                <thead>
                  <tr className="w-full text-white text-center font-poppins text-xs xl:text-md bg-colorBlue">
                    <th className="border border-black md:w-[5%]">No</th>
                    <th className="border border-black md:w-[10%]">Merek</th>
                    <th className="border border-black md:w-[15%]">
                      Nama Barang
                    </th>
                    <th className="border border-black md:w-[5%]">Kardus</th>
                    <th className="border border-black md:w-[10%]">
                      Harga Kardus
                    </th>
                    <th className="border border-black md:w-[10%]">
                      Ttl Kardus
                    </th>
                    <th className="border border-black md:w-[7%]">Tonase</th>
                    <th className="border border-black md:w-[15%]">
                      Harga Esti
                    </th>
                    <th className="border border-black md:w-[15%]">
                      Total Esti
                    </th>
                    <th className="border border-black md:w-[10%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {inputFields &&
                    inputFields.map((field, index) => (
                      <React.Fragment key={index}>
                        <tr
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
                              onChange={(event) =>
                                handleInputChange(index, event)
                              }
                            ></input>
                          </td>
                          <td className="border border-black">
                            <input
                              required
                              name="data_barang"
                              className="border m-2 w-24 md:w-3/4 p-1"
                              value={field.data_barang}
                              onChange={(event) =>
                                handleInputChange(index, event)
                              }
                            ></input>
                          </td>
                          <td className="border border-black">
                            <input
                              type="number"
                              required
                              name="data_box"
                              className="border m-2 w-24 md:w-3/4 p-1"
                              value={field.data_box}
                              onChange={(event) =>
                                handleInputKardus(index, event)
                              }
                            ></input>
                          </td>
                          <td className="border border-black">
                            <input
                              type="number"
                              required
                              readOnly
                              name="data_box_harga"
                              className="border m-2 w-24 md:w-3/4 p-1 bg-slate-300"
                              value={field.data_box_harga}
                              onChange={(event) =>
                                handleInputChange(index, event)
                              }
                            ></input>
                          </td>
                          <td className="border border-black">
                            <input
                              type="number"
                              required
                              name="data_box_rupiah"
                              className="border m-2 w-24 md:w-3/4 p-1 bg-slate-300"
                              value={field.data_box_rupiah}
                              onChange={(event) =>
                                handleInputChange(index, event)
                              }
                            ></input>
                          </td>
                          <td className="border border-black">
                            <input
                              type="number"
                              className="border m-2 w-24 md:w-3/4 p-1"
                              name="data_tonase"
                              value={field.data_tonase}
                              onChange={(event) =>
                                handleInputTonase(index, event)
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
                          <td className="border border-black bg-yellow-300">
                            <input
                              type="number"
                              className="border m-2 w-24 md:w-3/4 p-1"
                              name="data_datas"
                              value={field.data_datas}
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
                          <td className="border border-black bg-yellow-300">
                            <input
                              type="text"
                              className="border m-2 w-24 md:w-3/4 p-1 bg-slate-300"
                              name="data_estimasi"
                              value={RupiahFormat(field.data_estimasi)}
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

                                // { inputFields.length === 1 ? "" : ""}
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                        <p className="hidden">{number++}</p>
                      </React.Fragment>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="w-full flex gap-3 text-right justify-end mt-3">
              <button
                className="py-1 px-2 text-sm xl:text-md bg-blue-500 font-poppins text-colorGray rounded hover:bg-blue-400"
                type="submit"
                value="simcetak"
                name="type_submit"
              >
                <i className="fa fa-save"></i> Simpan & Cetak
              </button>
              <button
                className="py-1 px-2 text-sm xl:text-md bg-green-700 font-poppins text-colorGray rounded hover:bg-green-900"
                type="submit"
                value="simpan"
                name="type_submit"
              >
                <i className="fa fa-save"></i> Simpan
              </button>
            </div>
          </form>
          <div className="h-fit">
            <button
              className="bg-colorBlue xl:text-md text-colorGray py-1 px-2 rounded-sm my-1 font-poppins text-sm"
              type="button"
              onClick={() => handleAddField()}
            >
              <i className="fa fa-plus text-sm"></i> Tambah
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default TambahPengiriman;
