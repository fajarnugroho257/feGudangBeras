import React, { useState, useEffect, useRef } from "react";
import ModalAddPengiriman from "../components/ModalAddPengiriman";
import ModalEditPengiriman from "../components/ModalEditPengiriman";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import RupiahFormat from "../utilities/RupiahFormat";
import FormatTanggal from "../utilities/FormatTanggal";
import ModalNota from "../components/ModalNota";
import api from "../utilities/axiosInterceptor";

function Nota() {
  // TOKEN
  const token = localStorage.getItem("token");
  //
  let number = 1;
  const handleInputChange = (event) => {
    const name = event.target.name;
    const val = event.target.value;
    if (name === "dateFrom") {
      setDateFrom(val);
    }
    if (name === "dateTo") {
      setDateTo(val);
    }
  };

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
  const [blur, setBlur] = useState(true);
  const [datas, setDatas] = useState([]);
  const [modalBayar, setModalBayar] = useState(false);
  const [isFunctionComplete, setIsFunctionComplete] = useState(false);
  //
  const endPoint = "/index-draft-nota";
  //useEffect hook
  useEffect(() => {
    //function "fetchData"
    let params = {
      dateFrom: dateFrom,
      dateTo: dateTo,
    };
    setBlur(true);
    const fectData = async () => {
      try {
        //fetching
        const response = await api.post(endPoint, params, {
          headers: {
            Authorization: `Bearer ${token}`, // Sisipkan token di header
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        //get response data
        const data = await response.data?.dataNota;
        //
        if (response.status === 200) {
          setBlur(false);
          // console.log(data);
        }
        // console.log(data);
        //assign response data to state "posts"
        setDatas(data);
      } catch (error) {
        console.error("Error fetching nota data:", error);
        setBlur(false);
      }
    };
    fectData();
    setIsFunctionComplete(false);
  }, [dateFrom, dateTo, modalBayar, isFunctionComplete, token]);
  let jlh_pembelian = 0;

  const [notaId, setNotaId] = useState([]);
  //
  const handleDetailBayar = (id) => {
    setNotaId(id);
    setModalBayar(!modalBayar);
  };

  const handleClose = () => {
    setModalBayar(!modalBayar);
  };

  const handleDelete = async (nota_id) => {
    // alert(nota_id);
    const isConfirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus data ini?",
    );
    if (isConfirmed) {
      const toastId = toast.loading("Sending data...");
      try {
        const params = { nota_id: nota_id };
        const response = await api.post("/delete-nota", params, {
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
            render: "Delete data successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
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
    } else {
    }
    setIsFunctionComplete(true);
  };
  //
  return (
    <>
      <div className="p-1 md:p-3 xl:p-5">
        <div className=" w-full h-full mx-auto bg-gray-50 shadow-xl p-10">
          <div className="h-[10%] md:h-[10%] md:flex items-center mb-5 justify-between">
            <div className="ms:flex-col gap-2 md:flex items-center w-full">
              <input
                name="dateFrom"
                type="date"
                className="w-36 border-2 py-1 px-3 rounded-md border-colorBlue"
                placeholder="Dari"
                value={dateFrom}
                onChange={(event) => handleInputChange(event)}
              ></input>
              <p className="hidden md:block">Sampai</p>
              <input
                name="dateTo"
                type="date"
                className="w-36 border-2 py-1 px-3 rounded-md border-colorBlue"
                placeholder="Dari"
                value={dateTo}
                onChange={(event) => handleInputChange(event)}
              ></input>
            </div>
          </div>
          <div className="max-h-[80%] md:max-h[80%] overflow-x-scroll">
            <table
              className={`border font-poppins bg-colorBlue text-gray-700 text-xs md:text-sm w-full ${
                blur ? "blur-sm" : "blur-none"
              }`}
            >
              <thead>
                <tr className="text-center h-14 text-white">
                  <th className="border border-black w-[5%]">No</th>
                  <th className="border border-black w-[18%]">Nota</th>
                  <th className="border border-black w-[20%]">Created At</th>
                  <th className="border border-black w-[10%]">Suplier</th>
                  <th className="border border-black w-[15%]">Pembelian</th>
                  <th className="border border-black w-[15%]">
                    Total Pembelian
                  </th>
                  <th className="border border-black w-[7%]">Status</th>
                  <th className="border border-black w-[5%]">Bayar / Nitip</th>
                </tr>
              </thead>

              {datas.map((item, key) => {
                const first_nota_data = item.nota_data[0];
                const notaDataExceptFirst = item.nota_data.slice(1);
                const length = item.nota_data.length;
                const pembelian_pertama = first_nota_data.pembelian.pembelian_data;
                let jlh_pembelian_pertama = 0;
                return (
                  <>
                    <tr
                      key={item.pengiriman_id}
                      className={`${
                        number % 2 === 0 ? "bg-gray-50" : "bg-gray-200"
                      }`}
                    >
                      <td
                        className="border border-black text-center"
                        rowSpan={length}
                      >
                        {number}
                      </td>
                      <td
                        className="border border-black text-center"
                        rowSpan={length}
                      >
                        {item.nota_id}
                      </td>
                      <td
                        className="border border-black text-center"
                        rowSpan={length}
                      >
                        <span className="text-red-500">
                          {FormatTanggal(item.tanggal)}{" "}
                        </span>
                        <span className="text-blue-500"> Jam {item.waktu}</span>
                      </td>
                      <td className="border border-black px-2">
                        {first_nota_data.pembelian.suplier.suplier_nama}
                      </td>
                      <td className="border border-black text-center">
                        {FormatTanggal(first_nota_data.pembelian.pembelian_tgl)}
                      </td>
                      <td className="border border-black text-right px-2">
                        {/* pembelian_pertama */}
                        {pembelian_pertama.map((pem_per, inpem_per) => {
                          jlh_pembelian_pertama += parseInt(
                            pem_per.pembelian_total,
                          );
                        })}
                        {RupiahFormat(jlh_pembelian_pertama)}
                      </td>
                      <td
                        className="border border-black text-center"
                        rowSpan={length}
                      >
                        {item.nota_st === "yes" ? (
                          <span className="text-green-500 font-semibold">
                            Lunas
                          </span>
                        ) : (
                          <span className="text-red-500 font-semibold">
                            Hutang
                          </span>
                        )}
                      </td>
                      <td className="border border-black" rowSpan={length}>
                        <div className="flex mx-4 gap-2">
                          <i
                            className="fa fa-edit cursor-pointer text-green-500"
                            onClick={() => {
                              handleDetailBayar(item.id);
                            }}
                          ></i>
                          <i
                            className="fa fa-trash cursor-pointer text-red-500"
                            onClick={() => {
                              handleDelete(item.id);
                            }}
                          ></i>
                        </div>
                      </td>
                    </tr>
                    {notaDataExceptFirst &&
                      notaDataExceptFirst.map((value, index) => {
                        const pembelian = value.pembelian.pembelian_data;
                        jlh_pembelian = 0;
                        return (
                          <tr
                            className={`${
                              number % 2 === 0 ? "bg-gray-50" : "bg-gray-200"
                            }`}
                          >
                            <td className="border border-black px-2">
                              {value.pembelian.suplier.suplier_nama}
                            </td>
                            <td className="border border-black text-center">
                              {FormatTanggal(value.pembelian.pembelian_tgl)}
                            </td>
                            <td className="border border-black text-right px-2">
                              {pembelian.map((pem, inpem) => {
                                jlh_pembelian += parseInt(pem.pembelian_total);
                              })}
                              {RupiahFormat(jlh_pembelian)}
                            </td>
                          </tr>
                        );
                      })}
                    <p className="hidden">{number++}</p>
                  </>
                );
              })}
            </table>
          </div>
          <div className="max-h-[10%] md:max-h-[10%] flex justify-end mt-2"></div>
        </div>
        <ToastContainer />
      </div>
      {modalBayar && (
        <ModalNota isOpen={modalBayar} nota_id={notaId} isClose={handleClose} />
      )}
    </>
  );
}

export default Nota;
