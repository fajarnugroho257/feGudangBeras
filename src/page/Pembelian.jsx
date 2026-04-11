import React, { useState, useEffect } from "react";
import ModalAddPembelian from "../components/ModalAddPembelian";
import ModalEditPembelian from "../components/ModalEditPembelian";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RupiahFormat from "../utilities/RupiahFormat";
import FormatTanggal from "../utilities/FormatTanggal";
// import PrintComponent from "../components/PrintComponent";
import ModalPreview from "../components/ModalPreview";
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

  const [edit_id, setEdit_id] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // console.log(now);
  const [dateFrom, setDateFrom] = useState(firsttDate);
  const [dateTo, setDateTo] = useState(lastDate);
  const [supName, setSupName] = useState("");
  const [pembayaran, setPembayaran] = useState("");
  const handleInputChange = (event) => {
    const name = event.target.name;
    const val = event.target.value;
    if (name === "dateFrom") {
      setDateFrom(val);
    }
    if (name === "dateTo") {
      setDateTo(val);
    }
    if (name === "suplier_nama") {
      setSupName(val);
    }
    if (name === "pembayaran") {
      setPembayaran(val);
    }
  };

  const closeModal = () => setIsModalOpen(false);
  //
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [draftNota, setDraftNota] = useState(false);
  const openEditModal = (id) => {
    setIsModalEditOpen(true);
    setEdit_id(id);
  };
  const closeEditModal = () => {
    fectData();
    setIsModalEditOpen(false);
  };
  //define state
  const [datas, setDatas] = useState([]);
  let number = 0;
  const [blur, setBlur] = useState(true);
  //
  const fectData = async () => {
    //fetching
    let params = {
      dateFrom: dateFrom,
      dateTo: dateTo,
      supName: supName,
      pembayaran: pembayaran,
    };
    const response = await api.post("index-Pembelian", params, {
      headers: {
        Authorization: `Bearer ${token}`, // Sisipkan token di header
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    //get response data
    const data = await response.data.data;
    //
    if (response.status === 200) {
      setBlur(false);
    }
    // console.log(data);
    //assign response data to state "posts"
    setDatas(data);
  };
  //useEffect hook
  useEffect(() => {
    setBlur(true);
    fectData();
    setDraftNota(false);
  }, [dateFrom, dateTo, supName, pembayaran, draftNota]);

  let ttl_harga = 0;
  let ttl_total = 0;
  let ttl_tonase_kotor = 0;
  let ttl_tonase_potongan = 0;
  let ttl_tonase_bersih = 0;

  const handleDelete = async (id) => {
    // alert(id);
    const isConfirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus data ini?",
    );
    if (isConfirmed) {
      const toastId = toast.loading("Sending data...");
      try {
        const params = { id: id };
        const response = await api.post("/delete-Pembelian", params, {
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
          // load
          fectData();
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
  };
  //
  const downloadImage = async (id) => {
    // alert(id);

    const toastId = toast.loading("Sending data...");
    try {
      const response = await api.get(`/test-cetak-image/${id}`, {
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
      link.setAttribute("download", "Pembelian" + id + ".png"); // Nama file untuk diunduh
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

  const downloadLaporan = async () => {
    // alert(id);
    let params = {
      dateFrom: dateFrom,
      dateTo: dateTo,
      supName: supName,
      pembayaran: pembayaran,
    };
    // console.log(params);
    const toastId = toast.loading("Download data...");
    try {
      const response = await api.post(`/cetak-laporan`, params, {
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
      link.setAttribute("download", "Laporan-Pembelian.pdf"); // Nama file untuk diunduh
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

  const [selectedIds, setSelectedIds] = useState([]);
  // Fungsi untuk menangani perubahan checkbox
  const handleCheckboxChange = (id, index) => {
    setSelectedIds(
      (prevSelected) =>
        prevSelected.includes(id)
          ? prevSelected.filter((itemId) => itemId !== id) // Hapus ID jika sudah ada
          : [...prevSelected, id], // Tambahkan ID jika belum ada
    );
    // datas.filter((item) => item);
    const values = [...datas];
    values[index]["suplier_nota_st"] =
      values[index]["suplier_nota_st"] === "yes" ? "no" : "yes";
    setDatas(values);
  };
  //

  const buatNota = async () => {
    if (selectedIds.length < 1) {
      alert("Harus memilih setidaknya 1 data untuk dibuat nota");
    } else {
      const toastId = toast.loading("Getting data...");
      // console.log(selectedIds);
      try {
        const params = { selectedIds: selectedIds };
        const response = await api.post("/make-draft-nota", params, {
          headers: {
            Authorization: `Bearer ${token}`, // Sisipkan token di header
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        // set null
        // console.log("Response:", response);
        if (response.status === 200) {
          setDraftNota(true);
          setSelectedIds([]);
          //
          // console.log(response.data);
          if (response.data.success === true) {
            toast.update(toastId, {
              render: response.data.message,
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
          } else {
            toast.update(toastId, {
              render:
                "Error make nota, Suplier ID sudah tersedia : " +
                response.data.message,
              type: "error",
              isLoading: false,
              autoClose: 5000,
            });
          }
        } else {
          toast.update(toastId, {
            render:
              "Error make nota, Suplier ID sudah tersedia : " +
              response.message,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
      } catch (error) {
        toast.update(toastId, {
          render: "Error getting data! " + error.message,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        console.error("Error getting data:", error);
      }
    }
  };

  // modal cetak
  const [isModalCetak, setIsModalCetak] = useState(false);
  const viewModalCetak = (id) => {
    setIsModalCetak(!isModalCetak);
    setEdit_id(id);
  };
  //
  return (
    <div className="p-1 md:p-3 xl:p-5">
      <div className=" w-full h-full mx-auto bg-gray-50 shadow-xl p-4 md:p-8">
        <div className="h-[17%] md:h-[10%] xl:flex items-center mb-5 justify-between">
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
              name="suplier_nama"
              placeholder="Suplier"
              className="w-36 border-2 py-1 px-3 rounded-md border-colorBlue text-xs md:text-sm"
              value={supName}
              onChange={(event) => handleInputChange(event)}
            />
            <select
              className="w-36 border-2 py-1 px-3 rounded-md border-colorBlue text-xs md:text-sm"
              name="pembayaran"
              onChange={(event) => handleInputChange(event)}
            >
              <option value="">Semua</option>
              <option value="cash">Cash</option>
              <option value="hutang">Hutang</option>
            </select>
          </div>
          <div className="mt-1 md:mt-3 xl:mt-0 flex gap-2">
            <button
              onClick={() => buatNota()}
              className="cursor-pointer font-poppins text-xs font-semibold text-colorGray px-2 py-1 md:px-4 md:py-2 bg-blue-400 rounded-sm w-32 md:text-sm"
            >
              <i className="fa fa-book"></i> Buat Nota
            </button>
            <button
              onClick={() => {
                downloadLaporan();
              }}
              className="cursor-pointer font-poppins text-xs font-semibold text-colorGray px-2 py-1 md:px-4 md:py-2 bg-colorBlue rounded-sm w-fit flex gap-2 md:text-sm"
            >
              <i className="fa fa-download"></i>
              Download
            </button>
          </div>
        </div>
        <div className="max-h-[83%] md:max-h[80%] overflow-x-scroll">
          <table
            className={`border font-poppins bg-colorBlue text-gray-700 text-xs md:text-sm w-[120%] xl:w-full ${
              blur ? "blur-sm" : "blur-none"
            }`}
          >
            <thead>
              <tr className="text-center h-14 text-white" key="head-pembelian">
                <td className="border border-black w-[12%] px-1 md:w-[8%]">
                  Aksi
                </td>
                <td className="border border-black w-[5%]">No</td>
                <td className="border border-black w-[10%]">Suplier</td>
                <td className="border border-black w-[10%]">Tanggal</td>
                <td className="border border-black w-[12%]">Nama Barang</td>
                <td className="border border-black w-[9%]">Tonase Kotor</td>
                <td className="border border-black w-[5%]">Potongan</td>
                <td className="border border-black w-[9%]">Tonase Bersih</td>
                <td className="border border-black w-[11%]">Harga</td>
                <td className="border border-black w-[11%]">Total</td>
                <td className="border border-black w-[5%]">Pembayaran</td>
                <td className="border border-black w-[10%]">Total</td>
                <td className="border border-black w-[3%]">Nota</td>
              </tr>
            </thead>
            <tbody key="t-body-pembelian">
              {datas &&
                datas.map((item, index) => {
                  number++;
                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        key={"parent" + item.id}
                        className={`${
                          number % 2 === 0 ? "bg-gray-50" : "bg-gray-200"
                        }`}
                      >
                        <td
                          className="border border-black text-center cursor-pointer px-2 md:px-0"
                          rowSpan={item.listPembelian.length}
                        >
                          <div className="grid grid-cols-1 md:flex md:justify-center gap-1 md:gap-[6px]">
                            <i
                              onClick={() => {
                                downloadImage(item.id);
                              }}
                              className="fa fa-image text-blue-500 text-lg"
                            ></i>
                            <i
                              onClick={() => {
                                viewModalCetak(item.id);
                              }}
                              className="fa fa-download text-green-500 text-lg"
                            ></i>
                            <i
                              onClick={() => {
                                openEditModal(item.id);
                              }}
                              className="fa fa-edit text-yellow-500 text-lg"
                            ></i>
                            <i
                              onClick={() => {
                                handleDelete(item.id);
                              }}
                              className="fa fa-trash text-red-500 text-lg"
                            ></i>
                          </div>
                        </td>
                        <td
                          className="border border-black text-center"
                          rowSpan={item.listPembelian.length}
                        >
                          {number}
                        </td>
                        <td
                          className="border border-black py-1 px-2"
                          rowSpan={item.listPembelian.length}
                        >
                          {item.suplier_nama}
                        </td>
                        <td
                          className="border border-black text-center"
                          rowSpan={item.listPembelian.length}
                        >
                          {FormatTanggal(item.suplier_tgl)}
                        </td>
                        <td className="border border-black py-1 px-2">
                          {item.listPembelian[0] &&
                            item.listPembelian[0]["pembelian_nama"]}
                        </td>
                        <td className="border border-black text-center">
                          {item.listPembelian[0] &&
                            item.listPembelian[0]["pembelian_kotor"]}
                        </td>
                        <td className="border border-black text-center">
                          {item.listPembelian[0] &&
                            item.listPembelian[0]["pembelian_potongan"]}
                        </td>
                        <td className="border border-black text-center">
                          {item.listPembelian[0] &&
                            item.listPembelian[0]["pembelian_bersih"]}
                        </td>
                        <td className="border border-black text-right py-1 px-2">
                          {RupiahFormat(
                            item.listPembelian[0] &&
                              item.listPembelian[0]["pembelian_harga"],
                          )}
                        </td>
                        <td className="border border-black text-right py-1 px-2">
                          {RupiahFormat(
                            item.listPembelian[0] &&
                              item.listPembelian[0]["pembelian_total"],
                          )}
                        </td>
                        <td
                          className={`${
                            item.listPembelian[0] &&
                            item.listPembelian[0]["pembayaran"] === "cash"
                              ? "bg-green-500"
                              : "bg-red-500"
                          } border border-black text-center text-colorGray`}
                        >
                          {item.listPembelian[0] &&
                            item.listPembelian[0]["pembayaran"]}
                        </td>
                        <td
                          className="border border-black text-center"
                          rowSpan={item.listPembelian.length}
                        >
                          {RupiahFormat(item.ttlPembelian)}
                        </td>
                        <td
                          className="border border-black text-center"
                          rowSpan={item.listPembelian.length}
                        >
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
                            name="suplier_nota_st"
                            // value="yes"
                            onChange={(event) =>
                              handleCheckboxChange(item.id, index)
                            }
                            checked={item.suplier_nota_st === "yes"}
                            disabled={item.suplier_nota_st === "yes"}
                            // required={field.pembayaran === ""}
                          ></input>
                          {item.suplier_nota_st}
                        </td>
                      </tr>
                      {item.listPembelian.map((listPem, key) => {
                        ttl_harga += parseInt(listPem.pembelian_harga, 10);
                        ttl_total += parseInt(listPem.pembelian_total, 10);
                        ttl_tonase_kotor += parseFloat(listPem.pembelian_kotor);
                        ttl_tonase_potongan += parseFloat(
                          listPem.pembelian_potongan ?? 0,
                        );
                        ttl_tonase_bersih += parseFloat(
                          listPem.pembelian_bersih,
                        );
                        return (
                          <React.Fragment key={listPem.id}>
                            {JSON.stringify(key) === "0" ? null : (
                              <tr
                                key={"data" + listPem.id}
                                className={` ${
                                  number % 2 === 0
                                    ? "bg-gray-50"
                                    : "bg-gray-200"
                                }`}
                              >
                                <td className="border border-black py-1 px-2">
                                  {listPem.pembelian_nama}
                                </td>
                                <td className="border border-black text-center">
                                  {listPem.pembelian_kotor}
                                </td>
                                <td className="border border-black text-center">
                                  {listPem.pembelian_potongan}
                                </td>
                                <td className="border border-black text-center">
                                  {listPem.pembelian_bersih}
                                </td>
                                <td className="border border-black text-right py-1 px-2">
                                  {RupiahFormat(listPem.pembelian_harga)}
                                </td>
                                <td className="border border-black text-right py-1 px-2">
                                  {RupiahFormat(listPem.pembelian_total)}
                                </td>
                                <td
                                  className={`${
                                    listPem.pembayaran === "cash"
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  } border border-black text-center text-colorGray`}
                                >
                                  {listPem.pembayaran}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              <tr key={"jumlah"}>
                <td
                  colSpan="5"
                  className="border border-black text-right py-1 px-2"
                >
                  TOTAL
                </td>
                <td className="border border-black text-center py-1 px-2">
                  {Math.round(ttl_tonase_kotor * 100) / 100}
                </td>
                <td className="border border-black text-center py-1 px-2">
                  {Math.round(ttl_tonase_potongan * 100) / 100}
                </td>
                <td className="border border-black text-center py-1 px-2">
                  {Math.round(ttl_tonase_bersih * 100) / 100}
                </td>
                <td className="border border-black text-right py-1 px-2"></td>
                <td className="border border-black text-right py-1 px-2">
                  {RupiahFormat(ttl_total)}
                </td>
                <td className="border border-black text-right py-1 px-2"></td>
                <td className="border border-black text-right py-1 px-2"></td>
                <td className="border border-black text-right py-1 px-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer />
      {isModalEditOpen ? (
        <ModalEditPembelian
          isOpen={isModalEditOpen}
          onClose={closeEditModal}
          id={edit_id}
        />
      ) : (
        <>
          <ModalAddPembelian isOpen={isModalOpen} onClose={closeModal} />
        </>
      )}
      {isModalCetak && (
        <ModalPreview
          isOpen={true}
          onClose={() => setIsModalCetak(!isModalCetak)}
          id={edit_id}
        />
      )}
    </div>
  );
}

export default Pembelian;
