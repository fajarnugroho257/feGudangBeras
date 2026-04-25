import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import api from "../utilities/axiosInterceptor";
import FormatTanggal from "../utilities/FormatTanggal";
import RupiahFormat from "../utilities/RupiahFormat";
import quick from "../assets/img/logo192.png";

function TambahKaryawan() {
  // TOKEN
  const token = localStorage.getItem("token");
  //
  const [datas, setDatas] = useState([]);
  const [stModalAdd, setStModalAdd] = useState(false);
  const [stModalEdit, setStModalEdit] = useState(false);

  useEffect(() => {
    const fectData = async () => {
      //fetching
      const response = await api.get("/index-Karyawan", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      //get response data
      const data = await response.data.dataKaryawan;
      //assign response data to state
      setDatas(data);
    };
    fectData();
  }, [stModalAdd, stModalEdit]);

  const [formData, setFormData] = useState({
    karyawan_nama: "",
  });

  const handleModalAdd = () => {
    setStModalAdd(!stModalAdd);
    setFormData({
      karyawan_nama: "",
    });
  };

  const handleModalEdit = () => {
    setStModalEdit(!stModalEdit);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Sending data...");
    try {
      const response = await api.post("/add-Karyawan", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status) {
        toast.update(toastId, {
          render: "Data sent successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        handleModalAdd();
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
        render: "Error sending data!" + error,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const handleEdit = async (id) => {
    const toastId = toast.loading("Sending data...");
    try {
      const response = await api.get(`/detail-Karyawan/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (response.status) {
        setFormData({
          karyawan_nama: response.data.data.karyawan_nama,
          id: response.data.data.id,
        });
        toast.update(toastId, {
          render: "Data geting successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        handleModalEdit();
      } else {
        toast.update(toastId, {
          render: "Error geting data!" + response.status,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Error sending data!" + error,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Sending data...");
    try {
      const response = await api.post("/edit-Karyawan", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status) {
        toast.update(toastId, {
          render: "Data sent successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        handleModalEdit();
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
        render: "Error sending data!" + error,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const navigate = useNavigate();
  const handleTab = (event) => {
    navigate(`/${event}`);
  };

  // handle gaji
  const [modalGaji, setModalGaji] = useState(false);
  const [dataGaji, setDataGaji] = useState([]);
  const [karyawanNama, setKaryawanNama] = useState("");
  const currentMonth = new Date().getMonth() + 1;
  const [month, setMonth] = useState(currentMonth);
  const today = new Date();
  const year = today.getFullYear();
  const [yearNow, setYearNow] = useState(year);
  
  // lastDate
  const getLastDateOfMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDate = new Date(year, month + 1, 0);
    const date = lastDate.getDate();
    const formattedMonth = String(lastDate.getMonth() + 1).padStart(2, "0"); 
    const formattedYear = lastDate.getFullYear();
    return `${formattedYear}-${formattedMonth}-${date}`;
  };

  const lastDate = getLastDateOfMonth();

  const getFirstDateOfMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDate = new Date(year, month, 1);
    const date = String(firstDate.getDate()).padStart(2, "0"); 
    const formattedMonth = String(firstDate.getMonth() + 1).padStart(2, "0"); 
    const formattedYear = firstDate.getFullYear();
    return `${formattedYear}-${formattedMonth}-${date}`;
  };

  const firsttDate = getFirstDateOfMonth();
  const [dateFrom, setDateFrom] = useState(firsttDate);
  const [dateTo, setDateTo] = useState(lastDate);
  
  const handleInputChange = (event) => {
    const name = event.target.name;
    const val = event.target.value;
    if (name === "yearNow") {
      setYearNow(val);
    }
    if (name === "dateFrom") {
      setDateFrom(val);
      getDataGajiByDate(val, dateTo);
    }
    if (name === "dateTo") {
      setDateTo(val);
      getDataGajiByDate(dateFrom, val);
    }
  };
  
  const aturBulan = async (bln) => {
    setMonth(bln);
    getDataGajiByDate(bln, yearNow);
  };

  const getDataGajiByDate = async (from, to) => {
    try {
      const toastId = toast.loading("Getting data...");
      const response = await api.get(
        `/gaji-Karyawan/${idKaryawan}/${from}/${to}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      if (response.status === 200) {
        toast.update(toastId, {
          render: "Data getting successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setDataGaji(response.data.gaji);
        setKaryawanNama(response.data.karyawan.karyawan_nama);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // gaji
  const getDataGaji = async (id) => {
    try {
      const toastId = toast.loading("Getting data...");
      const response = await api.get(
        `/gaji-Karyawan/${id}/${dateFrom}/${dateTo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      if (response.status === 200) {
        toast.update(toastId, {
          render: "Data getting successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setDataGaji(response.data.gaji);
        setKaryawanNama(response.data.karyawan.karyawan_nama);
        setModalGaji(!modalGaji);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const [idKaryawan, setIdKaryawan] = useState("");
  
  const handleGaji = async (id) => {
    setIdKaryawan(id);
    getDataGaji(id);
  };
  const closeGaji = () => {
    setMonth(currentMonth);
    setModalGaji(!modalGaji);
    setDateFrom(firsttDate);
    setDateTo(lastDate);
  };
  
  const [tempId, setTempId] = useState([]);
  const [tempValue, setTempValue] = useState([]);
  
  const handleInputCheckbox = async (index, event, id, beban_value) => {
    const exists = tempId.some((item) => item === id);
    if (!exists) {
      setTempId([...tempId, id]);
      setTempValue([...tempValue, beban_value]);
    }
    const isConfirmed = window.confirm("Apakah Anda yakin merubah status ?");
    if (isConfirmed) {
      const values = [...dataGaji];
      values[index][event.target.name] = event.target.value;
      try {
        const toastId = toast.loading("Updating data...");
        const params = {
          id: id,
          beban_st: event.target.value,
        };
        const response = await api.post("/update-gaji-Karyawan", params, {
          headers: {
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        if (response.status) {
          toast.update(toastId, {
            render: "Updated successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
        }
      } catch (error) {}
      setDataGaji(values);
    }
  };
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(date);
  };
  
  const dataBulan = {
    1: "Januari", 2: "Februari", 3: "Maret", 4: "April", 5: "Mei", 6: "Juni",
    7: "Juli", 8: "Agustus", 9: "September", 10: "Oktober", 11: "November", 12: "Desember",
  };

  // PRINT
  const handlePrint = async () => {
    try {
      const ESC = "\x1B";
      const fontSmall = `${ESC}!\x01`; 
      let params = {
        idKaryawan: idKaryawan,
        from: dateFrom,
        to: dateTo,
      };
      
      const response = await api.post("/gaji-print", params, {
        headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const data = await response.data;
      const items = data.gaji;
      const currentDateTime = getCurrentDateTime();

      const columnWidths = [5, 15, 26]; 
      const header =
        `${fontSmall}` + 
        "Putra Cabe\n" +
        "Alamat Jln. Raya Bandongan - Magelang\nPaingan Trasan, Bandongan\n" +
        "HP. 0813 1300 5249 / 0813 9123 1224" +
        "\n-----------------------------------------------\n" +
        `Karyawan    : ${data.karyawan.karyawan_nama}\n` +
        `Nota Cetak  : ${currentDateTime[0]}\n` + 
        `Nota Jam    : ${currentDateTime[1]}\n` + 
        "-----------------------------------------------\n" +
        formatRow(["No", "Tangal", "Gaji"], columnWidths) +
        "\n" +
        "-----------------------------------------------\n";

      let num = 1;
      let gttl = 0;
      const rows = items
        .map((item) =>
          formatRow(
            [num++, item.beban_tgl, formatRupiah(parseInt(item.beban_value))],
            columnWidths
          )
        )
        .join("\n");
      items.forEach((data) => {
        gttl += parseInt(data.beban_value);
      });
      
      const footer =
        "-----------------------------------------------\n" +
        formatRow(["Grand Total", formatRupiah(gttl)], [21, 26]) +
        "\n-----------------------------------------------\n\n";

      const nota = `${fontSmall}` + header + rows + "\n" + footer + `${fontSmall}`; 
      console.log(nota); 

      const printData = new TextEncoder().encode(nota);

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
      });

      console.log("Perangkat ditemukan:", device.name);

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb");
      const characteristic = await service.getCharacteristic("00002af1-0000-1000-8000-00805f9b34fb");

      console.log("Data size:", printData.byteLength);
      
      function chunkArrayBuffer(buffer, chunkSize) {
        let chunks = [];
        for (let i = 0; i < buffer.byteLength; i += chunkSize) {
          chunks.push(buffer.slice(i, i + chunkSize));
        }
        return chunks;
      }

      async function sendDataInChunks(characteristic, data) {
        const chunkSize = 512; 
        const chunks = chunkArrayBuffer(data, chunkSize);

        for (const chunk of chunks) {
          await characteristic.writeValue(chunk);
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }
      
      await sendDataInChunks(characteristic, printData);
      console.log("Nota berhasil dicetak.");
      setTempId([]);
      setTempValue([]);
    } catch (error) {
      console.error("Gagal mencetak nota:", error);
    }
  };

  function getCurrentDateTime() {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    const tanggal = now.toLocaleDateString("id-ID", options); 
    const jam = now.toLocaleTimeString("id-ID"); 
    return [tanggal, jam];
  }

  function formatRow(columns, columnWidths) {
    return columns
      .map((col, index) => {
        const width = columnWidths[index];
        return col.toString().padEnd(width, " ");
      })
      .join(" ");
  }

  function formatRupiah(angka) {
    return `Rp${angka.toLocaleString("id-ID")}`;
  }
  
  return (
    <>
      <div className="p-1 md:p-3 xl:p-5 font-poppins">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 w-full h-full mx-auto flex flex-col">
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <button
              className="px-4 py-2 text-gray-500 hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors"
              onClick={() => handleTab("tambah-pembelian")}
            >
              Pembelian
            </button>
            <button
              className="px-4 py-2 text-gray-500 hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors"
              onClick={() => handleTab("tambah-pengiriman")}
            >
              Pengiriman
            </button>
            <button className="px-4 py-2 bg-teal-50 text-teal-700 font-bold rounded-lg text-sm border border-teal-200 transition-colors">
              Karyawan
            </button>
            {/* <button
              className="px-4 py-2 text-gray-500 hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors"
              onClick={() => handleTab("tambah-kardus")}
            >
              Kardus
            </button> */}
          </div>

          {/* Header Karyawan */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Daftar Karyawan</h2>
              <p className="text-xs text-gray-500 mt-1">Manajemen data dan gaji karyawan operasional</p>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              type="button"
              onClick={() => handleModalAdd()}
            >
              <i className="fa fa-plus text-xs"></i> Tambah Karyawan
            </button>
          </div>

          {/* VIEW MOBILE: CARD LAYOUT (Tampil < 768px)  */}
          <div className="md:hidden space-y-3 mb-6">
            {datas && datas.length > 0 ? (
              datas.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm uppercase">{item.karyawan_nama}</h3>
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block border border-gray-200">
                      ID: {item.id}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleGaji(item.id)}
                      className="w-8 h-8 flex justify-center items-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Slip Gaji"
                    >
                      <i className="fa fa-credit-card text-xs"></i>
                    </button>
                    <button 
                      onClick={() => handleEdit(item.id)}
                      className="w-8 h-8 flex justify-center items-center rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
                      title="Edit Karyawan"
                    >
                      <i className="fa fa-pen text-xs"></i>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                Data karyawan tidak ditemukan
              </div>
            )}
          </div>

          {/* VIEW DESKTOP: TABLE LAYOUT (Tampil > 768px) */}
          <div className="hidden md:block flex-1 overflow-hidden">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
              <div className="overflow-x-auto h-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-16">No</th>
                      <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Nama Karyawan</th>
                      <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center w-32">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {datas && datas.map((item, index) => {
                      const rowNumber = index + 1;
                      return (
                        <tr key={item.id} className="hover:bg-teal-50/20 transition-colors">
                          <td className="py-3 px-4 text-center text-sm font-medium text-gray-500 border-r border-gray-100">
                            {rowNumber}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-800 font-bold uppercase border-r border-gray-100">
                            {item.karyawan_nama}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center items-center gap-2">
                              <button 
                                onClick={() => handleGaji(item.id)}
                                className="w-8 h-8 flex justify-center items-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Slip Gaji"
                              >
                                <i className="fa fa-credit-card text-sm"></i>
                              </button>
                              <button 
                                onClick={() => handleEdit(item.id)}
                                className="w-8 h-8 flex justify-center items-center rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
                                title="Edit"
                              >
                                <i className="fa fa-pen text-sm"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer position="bottom-right" />
      </div>

      {/* ======================================= */}
      {/* MODAL TAMBAH KARYAWAN                     */}
      {/* ======================================= */}
      {stModalAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 font-poppins">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => handleModalAdd()}></div>
          
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                  <i className="fa fa-user-plus text-lg"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 leading-tight">Tambah Karyawan</h2>
                </div>
              </div>
              <button onClick={() => handleModalAdd()} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <i className="fa fa-times text-lg"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-5 bg-gray-50/30">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Karyawan</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                  placeholder="Masukkan nama karyawan..."
                  name="karyawan_nama"
                  value={formData.karyawan_nama}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3">
                <button type="button" onClick={() => handleModalAdd()} className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2">
                  <i className="fa fa-save"></i> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL EDIT KARYAWAN                       */}
      {/* ======================================= */}
      {stModalEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 font-poppins">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => handleModalEdit()}></div>
          
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                  <i className="fa fa-user-edit text-lg"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 leading-tight">Ubah Karyawan</h2>
                </div>
              </div>
              <button onClick={() => handleModalEdit()} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <i className="fa fa-times text-lg"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmitEdit}>
              <div className="p-5 bg-gray-50/30">
                <input type="hidden" value={formData.id} />
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Karyawan</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                  placeholder="Masukkan nama karyawan..."
                  name="karyawan_nama"
                  value={formData.karyawan_nama}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3">
                <button type="button" onClick={() => handleModalEdit()} className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2">
                  <i className="fa fa-save"></i> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL GAJI KARYAWAN                       */}
      {/* ======================================= */}
      {modalGaji && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 font-poppins">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => closeGaji()}></div>
          
          <div className="bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden">
            
            {/* Header Gaji */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <i className="fa fa-wallet text-lg"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 leading-tight">Slip Gaji: {karyawanNama}</h2>
                  <p className="text-xs text-gray-500">Kelola operasional dan gaji karyawan</p>
                </div>
              </div>
              <button onClick={() => closeGaji()} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <i className="fa fa-times text-lg"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-gray-50/30">
              
              {/* Filter & Print Bar */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-5">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Dari Tanggal</label>
                    <input
                      name="dateFrom"
                      type="date"
                      className="w-full sm:w-36 border border-gray-200 py-2 px-3 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                      value={dateFrom}
                      onChange={(event) => handleInputChange(event)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Sampai Tanggal</label>
                    <input
                      name="dateTo"
                      type="date"
                      className="w-full sm:w-36 border border-gray-200 py-2 px-3 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                      value={dateTo}
                      onChange={(event) => handleInputChange(event)}
                    />
                  </div>
                </div>

                <button
                  onClick={handlePrint}
                  className="w-full sm:w-auto px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fa fa-print"></i> Cetak Slip Gaji
                </button>
              </div>

              {/* Table Gaji - VIEW MOBILE (Card) */}
              <div className="md:hidden space-y-3 mb-4">
                {dataGaji && dataGaji.length > 0 ? (
                  dataGaji.map((item, index) => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-2">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="font-bold text-gray-800 text-sm">{FormatTanggal(item.beban_tgl)}</span>
                        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 border border-gray-200 px-2 py-1 rounded-md">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                            name="beban_st"
                            value={item.beban_st === "yes" ? "no" : "yes"}
                            onChange={(event) => handleInputCheckbox(index, event, item.id, item.beban_value)}
                            disabled={item.beban_st === "yes"}
                            checked={item.beban_st === "yes"}
                          />
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lunas</span>
                        </label>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 uppercase font-bold">Terakhir Diupdate</span>
                          <span className="text-xs text-gray-600">{formatDate(item.updated_at)}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-800">{RupiahFormat(item.beban_value)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                    Data gaji tidak ditemukan
                  </div>
                )}
              </div>

              {/* Table Gaji - VIEW DESKTOP (Table) */}
              <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200">
                        <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-16">No</th>
                        <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-40">Tanggal</th>
                        <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200 w-48">Jumlah Gaji (Rp)</th>
                        <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-32">Status Lunas</th>
                        <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center w-48">Terakhir Update</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dataGaji && dataGaji.length > 0 ? (
                        dataGaji.map((item, index) => {
                          const rowNumber = index + 1;
                          return (
                            <tr key={item.id} className="hover:bg-teal-50/20 transition-colors">
                              <td className="py-3 px-4 text-center text-sm font-medium text-gray-500 border-r border-gray-100">{rowNumber}</td>
                              <td className="py-3 px-4 text-sm text-gray-700 font-medium border-r border-gray-100">{FormatTanggal(item.beban_tgl)}</td>
                              <td className="py-3 px-4 text-right text-sm text-gray-800 font-bold border-r border-gray-100">{RupiahFormat(item.beban_value)}</td>
                              <td className="py-3 px-4 text-center border-r border-gray-100">
                                <input
                                  type="checkbox"
                                  className="w-5 h-5 text-teal-600 bg-white border-gray-300 rounded focus:ring-teal-500 cursor-pointer disabled:opacity-50"
                                  name="beban_st"
                                  value={item.beban_st === "yes" ? "no" : "yes"}
                                  onChange={(event) => handleInputCheckbox(index, event, item.id, item.beban_value)}
                                  disabled={item.beban_st === "yes"}
                                  checked={item.beban_st === "yes"}
                                />
                              </td>
                              <td className="py-3 px-4 text-center text-xs text-gray-500">
                                {formatDate(item.updated_at)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-6 text-gray-500 italic bg-gray-50 rounded-lg">
                            Data gaji tidak ditemukan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Gaji */}
              {dataGaji.length > 0 && (
                <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-4 shadow-sm flex justify-between items-center">
                  <span className="text-sm font-bold text-teal-900 uppercase">Total Gaji ({dataGaji.length} Hari)</span>
                  <span className="text-xl font-bold text-teal-700">
                    {RupiahFormat(dataGaji.reduce((acc, curr) => acc + parseInt(curr.beban_value), 0))}
                  </span>
                </div>
              )}
            </div>

            {/* Footer Modal Gaji */}
            <div className="p-5 border-t border-gray-100 bg-white flex justify-end shrink-0">
              <button
                type="button"
                className="px-6 py-2.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors shadow-sm"
                onClick={() => closeGaji()}
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TambahKaryawan;