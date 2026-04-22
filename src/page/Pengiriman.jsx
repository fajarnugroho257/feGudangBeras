import React, { useState, useEffect, useRef } from "react";
import ModalAddPengiriman from "../components/ModalAddPengiriman";
import ModalEditPengiriman from "../components/ModalEditPengiriman";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import RupiahFormat from "../utilities/RupiahFormat";
import FormatTanggal from "../utilities/FormatTanggal";
import ModalPreviewPembelian from "../components/ModalPreviewPembelian";
import api from "../utilities/axiosInterceptor";

function Pembelian() {
  // TOKEN
  const token = localStorage.getItem("token");
  //
  // lastDate
  const getLastDateOfMonth = () => {
    const today = new Date(); // Tanggal hari ini
    const year = today.getFullYear();
    const month = today.getMonth();

    // Mendapatkan tanggal terakhir bulan ini
    const lastDate = new Date(year, month + 1, 0);
    const date = lastDate.getDate();
    const formattedMonth = String(lastDate.getMonth() + 1).padStart(2, "0"); // Bulan dimulai dari 0, jadi ditambah 1
    const formattedYear = lastDate.getFullYear();

    return `${formattedYear}-${formattedMonth}-${date}`;
  };

  const lastDate = getLastDateOfMonth();

  const getFirstDateOfMonth = () => {
    const today = new Date(); // Tanggal hari ini
    const year = today.getFullYear();
    const month = today.getMonth();

    // Mendapatkan tanggal pertama bulan ini
    const firstDate = new Date(year, month, 1);
    const date = String(firstDate.getDate()).padStart(2, "0"); // Tambahkan 0 jika kurang dari 2 digit
    const formattedMonth = String(firstDate.getMonth() + 1).padStart(2, "0"); // Bulan juga dalam dua digit
    const formattedYear = firstDate.getFullYear();

    return `${formattedYear}-${formattedMonth}-${date}`;
  };

  const firsttDate = getFirstDateOfMonth();

  const [dateFrom, setDateFrom] = useState(firsttDate);
  const [dateTo, setDateTo] = useState(lastDate);
  const [data_merek, setdata_merek] = useState("");
  const handleInputChange = (event) => {
    const val = event.target.value;
    const name = event.target.name;
    if (name === "dateFrom") {
      setDateFrom(val);
    }
    if (name === "dateTo") {
      setDateTo(val);
    }
    if (name === "data_merek") {
      setdata_merek(val);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [edit_id, setEdit_id] = useState(null);
  const [valueSt, setValueSt] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  //
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const openEditModal = (pengiriman_id) => {
    setIsModalEditOpen(true);
    setEdit_id(pengiriman_id);
  };
  const closeEditModal = () => setIsModalEditOpen(false);
  //define state
  const [datas, setDatas] = useState([]);
  const [blur, setBlur] = useState(true);
  let [number, setNumber] = useState(1);
  const [endPoint, setEndPoint] = useState("/index-Pengiriman");
  const [dataKaryawan, setDataKaryawan] = useState([]);
  const [stModalBeban, setStModalBeban] = useState(false);
  //useEffect hook
  const fectData = async () => {
    let params = {
      dateFrom: dateFrom,
      dateTo: dateTo,
      params: data_merek,
    };
    setBlur(true);
    const response = await api.post(endPoint, params, {
      headers: {
        Authorization: `Bearer ${token}`, // Sisipkan token di header
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    //get response data
    const data = await response.data.data;
    if (response.status === 200) {
      setBlur(false);
    }
    // console.log(data);
    // console.log(response.data.data_kosong);
    //assign response data to state "posts"
    setDatas(data);
  };
  useEffect(() => {
    fectData();
    const fectDataKaryawan = async () => {
      const data_karyawan = await api.get("/get-karyawan", {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const data = await data_karyawan.data.dataKaryawan;
      setDataKaryawan(data);
    };
    setValueSt(false);
    fectDataKaryawan();
  }, [
    isModalOpen,
    endPoint,
    dateFrom,
    dateTo,
    isModalEditOpen,
    stModalBeban,
    valueSt,
    data_merek,
  ]);

  const changeAfterAddData = (suplierData) => {
    // console.log(suplierData);
  };

  const changeEndPoint = (url, label) => {
    setEndPoint(url);
    let num = parseInt(label) * 5 - 5 + 1;
    setNumber(num);
  };

  // Menghitung grand total dari semua subItems
  const grandTotal = datas.reduce((total, item) => {
    // Menambahkan jumlah dari setiap subItem
    const subTotal = item.listPengiriman.reduce(
      (subTotal, subItem) => subTotal + Number(subItem.data_total),
      0,
    );
    return total + subTotal;
  }, 0);

  const inputRef = useRef(null);

  const handleInput = (key, event) => {
    datas[key]["jumlah"] = event.target.value;
    setDatas(datas);
    console.log(datas);
  };

  // console.log(datas);
  const handleSimpan = (pengiriman_id, kunci) => {
    alert(pengiriman_id);
    // alert(kunci);
    const filteredData = datas.filter(
      (item) => item.pengiriman_id === pengiriman_id,
    );

    // var jumlah = datas.filter((item) => item.pengiriman_id === pengiriman_id);
    // console.log(filteredData[0]["jumlah"]);
  };

  // MULAI
  const [inputBebanKaryawan, setInputBebanKaryawan] = useState([
    {
      karyawan_id: "",
      beban_value: "",
    },
  ]);

  const handleAddKaryawan = () => {
    setInputBebanKaryawan([
      ...inputBebanKaryawan,
      {
        karyawan_id: "",
        beban_value: "",
      },
    ]);
  };
  const [bebanKardus, setInputBebanKardus] = useState("0");
  //
  const [inputBebanLain, setInputBebanLain] = useState([
    {
      beban_nama: "",
      beban_value: "",
    },
  ]);

  const handleAddLain = () => {
    setInputBebanLain([
      ...inputBebanLain,
      {
        beban_nama: "",
        beban_value: "",
      },
    ]);
  };

  //

  const [pengiriman_id, setSPengiriman_id] = useState(null);
  const [pengiriman_tgl, setSPengiriman_tgl] = useState(null);
  //
  const handleModalBeban = (pengiriman_id, pengiriman_tgl) => {
    setSPengiriman_id(pengiriman_id);
    setSPengiriman_tgl(pengiriman_tgl);
    //
    setStModalBeban(!stModalBeban);
  };

  const [isFunctionComplete, setIsFunctionComplete] = useState(false);

  useEffect(() => {
    //panggil method "fetchData"
    //function "fetchData"
    const fectData = async () => {
      let params = {
        pengiriman_tgl: pengiriman_tgl,
        pengiriman_id: pengiriman_id,
      };
      // console.log(params);
      //fetching
      const response = await api.post("/detail-Pengiriman-Beban", params, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 200) {
        //get response data
        const dataBebanKaryawan = await response.data.dataBebanKaryawan;
        const dataBebanLain = await response.data.dataBebanLain;
        const dataBebanKardus = await response.data.bebanKardus;
        setInputBebanKaryawan(dataBebanKaryawan);
        setInputBebanLain(dataBebanLain);
        setInputBebanKardus(dataBebanKardus);
      }
      //assign response data to state "posts"
      // setDatas(data);
    };
    fectData();
    setIsFunctionComplete(false);
  }, [stModalBeban, pengiriman_id, pengiriman_tgl, isFunctionComplete]);

  const handleRemoveField = (index) => {
    const values = [...inputBebanKaryawan];
    values.splice(index, 1);
    setInputBebanKaryawan(values);
  };

  const handleInputKaryawan = (index, event) => {
    const values = [...inputBebanKaryawan];
    values[index][event.target.name] = event.target.value;
    setInputBebanKaryawan(values);
  };

  const handleInputLain = (index, event) => {
    const values = [...inputBebanLain];
    values[index][event.target.name] = event.target.value;
    setInputBebanLain(values);
  };

  //
  const handleRemoveFieldLain = (index) => {
    const values = [...inputBebanLain];
    values.splice(index, 1);
    setInputBebanLain(values);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const toastId = toast.loading("Sending data...");
    try {
      // console.log(inputFields);
      const data = {
        pengiriman_tgl: pengiriman_tgl,
        pengiriman_id: pengiriman_id,
      };
      let params = {
        formDataKaryawan: inputBebanKaryawan,
        formDataLain: inputBebanLain,
        pengirimanData: data,
      };
      console.log(params);
      const response = await api.post("/add-Pengiriman-Beban", params, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      // set null
      // console.log("Response:", response.status);
      if (response.status === 200) {
        const dataKaryawan = {
          karyawan_id: "",
          beban_value: "",
        };
        const dataLain = {
          beban_nama: "",
          beban_value: "",
        };
        // setInputBebanKaryawan([dataKaryawan]);
        // setInputBebanLain([dataLain]);
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

  const handleDelete = async (pengiriman_id) => {
    // alert(pengiriman_id);
    const isConfirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus data ini?",
    );
    if (isConfirmed) {
      const toastId = toast.loading("Sending data...");
      try {
        const params = { pengiriman_id: pengiriman_id };
        const response = await api.post("/delete-Pengiriman", params, {
          headers: {
            Authorization: `Bearer ${token}`, // Sisipkan token di header
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        // console.log("Response:", response.status);
        if (response.status === 200) {
          //
          fectData();
          toast.update(toastId, {
            render: "Delete data successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          //
        } else {
          toast.update(toastId, {
            render: "Error delete data!" + response.status,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
      } catch (error) {
        toast.update(toastId, {
          render: "Error delete data! " + error.message,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        console.error("Error posting data:", error);
      }
      setIsFunctionComplete(true);
    }
  };

  const downloadImage = async (pengiriman_id) => {
    // alert(pengiriman_id);

    const toastId = toast.loading("Sending data...");
    try {
      const response = await api.get(
        `/pengiriman-cetak-image/${pengiriman_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Sisipkan token di header
          },
          responseType: "blob", // penting untuk men-download file
        },
      );

      // Membuat URL untuk file yang didownload
      const url = window.URL.createObjectURL(new Blob([response.data]));
      // alert(url);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Pengiriman.png"); // Nama file untuk diunduh
      document.body.appendChild(link);
      link.click(); // Memicu download
      document.body.removeChild(link); // Menghapus link setelah download

      // set null
      // console.log("Response:", response.status);
      if (response.status === 200) {
        //
        toast.update(toastId, {
          render: "Download successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: "Error Download!" + response.status,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Error Download! " + error.message,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      console.error("Error downloading the file:", error);
    }
  };
  // modal cetak
  const [isModalCetak, setIsModalCetak] = useState(false);
  const viewModalCetak = (suplier_id) => {
    setIsModalCetak(!isModalCetak);
    setEdit_id(suplier_id);
  };
  //
  let ttl_operational = 0;
  let ttl_data_total = 0;
  // modul edit real
  const formatNumber = (number) => {
    return new Intl.NumberFormat("id-ID").format(number);
  };
  // end
  return (
    <>
      <div className="p-1 md:p-3 xl:p-5">
        <div className=" w-full h-full mx-auto bg-gray-50 shadow-xl p-4 md:p-8">
          <div className="h-[15%] md:h-[5%] md:flex items-center mb-5 justify-between">
            <div className="ms:flex-col gap-2 md:flex items-center w-full">
              <input
                name="dateFrom"
                type="date"
                className="w-36 border-2 py-1 px-3 rounded-md border-colorBlue text-xs md:text-sm"
                placeholder="Dari"
                value={dateFrom}
                onChange={(event) => handleInputChange(event)}
              ></input>
              <p className="hidden md:block">Sampai</p>
              <input
                name="dateTo"
                type="date"
                className="w-36 border-2 py-1 px-3 rounded-md border-colorBlue text-xs md:text-sm"
                placeholder="Dari"
                value={dateTo}
                onChange={(event) => handleInputChange(event)}
              ></input>
              <input
                name="data_merek"
                placeholder="Merek"
                className="w-36 border-2 py-1 px-3 rounded-md border-colorBlue text-xs md:text-sm"
                value={data_merek}
                onChange={(event) => handleInputChange(event)}
              />
            </div>
          </div>
          <div className="max-h-[80%] md:h-full overflow-x-scroll">
            <table
              className={`border font-poppins bg-colorBlue text-gray-700 text-xs md:text-sm  w-full ${
                blur ? "blur-sm" : "blur-none"
              }`}
            >
              <thead>
                <tr className="text-center h-14 text-white">
                  <th className="border border-black w-[10%] px-2 md:w-[5%]">
                    Aksi
                  </th>
                  <th className="border border-black w-[3%]">No</th>
                  <th className="border border-black w-[8%]">Tanggal</th>
                  <th className="border border-black w-[10%]">Nama Pembeli</th>
                  <th className="border border-black w-[8%]">Uang Muka</th>
                  <th className="border border-black w-[5%]">Status</th>
                  <th className="border border-black w-[8%]">Atur Ops</th>
                  <th className="border border-black w-[8%]">Barang</th>
                  <th className="border border-black w-[8%]">Supplier</th>
                  <th className="border border-black w-[5%]">Tonase</th>
                  <th className="border border-black w-[6%]">Harga</th>
                  <th className="border border-black w-[8%]">Total</th>
                  <th className="border border-black w-[5%]">Pembayaran</th>
                </tr>
              </thead>
              <tbody>
                {datas.map((item, key) => {
                  ttl_operational += item.totalBeban;
                  number++;
                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        key={item.id}
                        className={`${
                          number % 2 === 0 ? "bg-gray-50" : "bg-gray-200"
                        }`}
                      >
                        <td
                          className="border border-black text-center cursor-pointer"
                          rowSpan={item.listPengiriman.length}
                        >
                          <div className="md:grid md:grid-cols-2 md:gap-2 p-2">
                            <i
                              onClick={() => {
                                downloadImage(item.id);
                              }}
                              className="fa fa-image text-blue-500"
                            ></i>
                            <i
                              onClick={() => {
                                viewModalCetak(item.id);
                              }}
                              className="fa fa-download text-green-500"
                            ></i>
                            <i
                              onClick={() => {
                                openEditModal(item.id);
                              }}
                              className="fa fa-edit text-yellow-500"
                            ></i>
                            <i
                              onClick={() => {
                                handleDelete(item.id);
                              }}
                              className="fa fa-trash text-red-500"
                            ></i>
                          </div>
                        </td>
                        <td
                          className="border border-black text-center"
                          rowSpan={item.listPengiriman.length}
                        >
                          {number}
                        </td>
                        <td
                          className="border border-black text-center"
                          rowSpan={item.listPengiriman.length}
                        >
                          {FormatTanggal(item.pengiriman_tgl)}
                        </td>
                        <td
                          className="border border-black text-center"
                          rowSpan={item.listPengiriman.length}
                        >
                          {item.nama_pembeli}
                        </td>
                        <td
                          className="border border-black text-right px-2 py-1"
                          rowSpan={item.listPengiriman.length}
                        >
                          {RupiahFormat(item.uang_muka)}
                        </td>
                        <td
                          className="border border-black text-center"
                          rowSpan={item.listPengiriman.length}
                        >
                          {item.status}
                        </td>
                        <td
                          className="border border-black text-right px-2 py-1"
                          rowSpan={item.listPengiriman.length}
                        >
                          <i
                            className="mr-3 fa fa-book text-green-700 cursor-pointer"
                            title="Atur Operational"
                            onClick={() =>
                              handleModalBeban(item.id, item.pengiriman_tgl)
                            }
                          ></i>
                          {RupiahFormat(item.totalBeban)}
                        </td>
                        <td className="border border-black text-center">
                          {item.listPengiriman[0] &&
                            item.listPengiriman[0].barang?.nama}
                        </td>
                        <td className="border border-black text-center">
                          {item.listPengiriman[0] &&
                            item.listPengiriman[0].suplier?.suplier_nama}
                        </td>
                        <td className="border border-black text-center">
                          {item.listPengiriman[0] &&
                            item.listPengiriman[0]["data_tonase"]}
                        </td>
                        <td className="border border-black text-right px-2 py-1">
                          {RupiahFormat(
                            item.listPengiriman[0] &&
                              item.listPengiriman[0]["data_harga"],
                          )}
                        </td>
                        <td className="border border-black text-right px-2 py-1">
                          {RupiahFormat(
                            item.listPengiriman[0] &&
                              item.listPengiriman[0]["data_total"],
                          )}
                        </td>
                        <td
                          className={`${
                            item.listPengiriman[0] &&
                            item.listPengiriman[0]["pembayaran_st"] === "cash"
                              ? "bg-green-500"
                              : "bg-red-500"
                          } border border-black text-center text-colorGray`}
                        >
                          {item.listPengiriman[0] &&
                            item.listPengiriman[0]["pembayaran_st"]}
                        </td>
                      </tr>
                      {item.listPengiriman &&
                        item.listPengiriman.map((listPem, key) => {
                          let total = listPem.data_total;
                          ttl_data_total += parseInt(total ?? 0, 10);

                          return (
                            <React.Fragment key={listPem.id}>
                              {JSON.stringify(key) === "0" ? null : (
                                <tr
                                  key={listPem.id}
                                  className={` ${
                                    number % 2 === 0
                                      ? "bg-gray-50"
                                      : "bg-gray-200"
                                  }`}
                                >
                                  <td className="border border-black text-center">
                                    {listPem.barang?.nama}
                                  </td>
                                  <td className="border border-black text-center">
                                    {listPem.suplier?.suplier_nama}
                                  </td>
                                  <td className="border border-black text-center">
                                    {listPem.data_tonase}
                                  </td>
                                  <td className="border border-black text-right px-2 py-1">
                                    {RupiahFormat(listPem.data_harga)}
                                  </td>
                                  <td className="border border-black text-right px-2 py-1">
                                    {RupiahFormat(listPem.data_total)}
                                  </td>
                                  <td
                                    className={`${
                                      listPem.pembayaran_st === "cash"
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                    } border border-black text-center text-colorGray`}
                                  >
                                    {listPem.pembayaran_st}
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
                <tr>
                  <td
                    colSpan="6"
                    className="border border-black text-right px-2 py-1"
                  >
                    Total Operational
                  </td>
                  <td className="border border-black text-right px-2 py-1">
                    {RupiahFormat(ttl_operational)}
                  </td>
                  <td
                    colSpan="4"
                    className="border border-black text-right px-2 py-1"
                  >
                    GRAND TOTAL
                  </td>
                  <td className="border border-black text-right px-2 py-1">
                    {RupiahFormat(ttl_data_total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <ToastContainer />
        {isModalEditOpen ? (
          <ModalEditPengiriman
            isOpen={isModalEditOpen}
            onClose={closeEditModal}
            pengiriman_id={edit_id}
          />
        ) : (
          <>
            <ModalAddPengiriman
              isOpen={isModalOpen}
              onClose={closeModal}
              listData={changeAfterAddData}
            />
          </>
        )}
        {isModalCetak && (
          <ModalPreviewPembelian
            isOpen={true}
            onClose={() => setIsModalCetak(!isModalCetak)}
            pengiriman_id={edit_id}
          />
        )}
      </div>
      {stModalBeban && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
          <div className="bg-white w-[90%] md:w-3/4 md:h-[90%] h-3/4 p-6 rounded-lg shadow-lg relative z-10">
            <div className="w-full h-[10%]">
              <h2 className="text-xl font-semibold mb-2 text-colorBlue font-poppins">
                Atur Operasional Pengiriman
              </h2>
              <div className="h-[2px] w-full bg-colorBlue mb-4"></div>
            </div>
            <div className="w-full h-[80%] overflow-auto">
              <form onSubmit={handleSubmit}>
                <input type="hidden" value={pengiriman_id} />
                <input type="hidden" value={pengiriman_tgl} />
                <h3 className="text-lg font-semibold font-poppins text-colorBlue my-3">
                  1. Operasional kardus <br />
                </h3>
                <p className="ml-3 font-poppins text-red-600">
                  {RupiahFormat(bebanKardus)}
                </p>
                <h3 className="text-lg font-semibold font-poppins text-colorBlue my-3">
                  2. Operasional karyawan
                </h3>
                {inputBebanKaryawan.map((field, index) => (
                  <div className="flex" key={index}>
                    <select
                      required
                      name="karyawan_id"
                      className="border m-2 w-24 md:w-3/4 p-1"
                      value={field.karyawan_id}
                      onChange={(event) => handleInputKaryawan(index, event)}
                    >
                      <option value="">----</option>
                      {dataKaryawan.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.karyawan_nama}
                        </option>
                      ))}
                    </select>
                    <input
                      required
                      name="beban_value"
                      type="number"
                      className="border m-2 w-24 md:w-3/4 p-1"
                      placeholder="Nilai Operasional"
                      value={field.beban_value}
                      onChange={(event) => handleInputKaryawan(index, event)}
                    />
                    <button
                      className={` bg-red-600 text-colorGray py-1 px-2 rounded-md my-2 font-sm md:font-normal`}
                      type="button"
                      onClick={() => handleRemoveField(index)}
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </div>
                ))}
                <button
                  className="bg-gray-600 text-colorGray py-1 px-2 rounded-sm my-1 font-poppins text-sm"
                  type="button"
                  onClick={() => handleAddKaryawan()}
                >
                  <i className="fa fa-plus text-sm"></i> Tambah Operasional
                  Karyawan
                </button>
                <hr className="border-colorBlue border-b-2 mt-2" />
                <h3 className="text-lg font-semibold font-poppins text-colorBlue my-3">
                  3. Operasional Lainnya
                </h3>
                {inputBebanLain.map((field, index) => (
                  <div className="flex" key={index}>
                    <input
                      required
                      name="beban_nama"
                      type="text"
                      className="border m-2 w-24 md:w-3/4 p-1"
                      placeholder="Nama Operasional"
                      value={field.beban_nama}
                      onChange={(event) => handleInputLain(index, event)}
                    />
                    <input
                      required
                      name="beban_value"
                      type="number"
                      className="border m-2 w-24 md:w-3/4 p-1"
                      placeholder="Nilai Operasional"
                      value={field.beban_value}
                      onChange={(event) => handleInputLain(index, event)}
                    />
                    <button
                      className={` bg-red-600 text-colorGray py-1 px-2 rounded-md my-2 font-sm md:font-normal`}
                      type="button"
                      onClick={() => handleRemoveFieldLain(index)}
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </div>
                ))}
                <button
                  className="bg-gray-600 text-colorGray py-1 px-2 rounded-sm my-1 font-poppins text-sm"
                  type="button"
                  onClick={() => handleAddLain()}
                >
                  <i className="fa fa-plus text-sm"></i> Tambah Operasional Lain
                </button>
                <br />
                <button
                  className="mt-5 py-1 px-2 bg-green-700 font-poppins text-colorGray rounded hover:bg-green-900"
                  type="submit"
                >
                  <i className="fa fa-save"></i> Simpan
                </button>
              </form>
            </div>
            <div className="w-full h-[10%]">
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-colorGray border-2 border-colorBlue font-poppins text-colorBlue rounded hover:bg-slate-200"
                  onClick={() => handleModalBeban()}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Pembelian;
