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
          Authorization: `Bearer ${token}`, // Sisipkan token di header
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      //get response data
      const data = await response.data.dataKaryawan;
      //
      if (response.status === 200) {
      }
      //assign response data to state "posts"
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
          Authorization: `Bearer ${token}`, // Sisipkan token di header
          "Content-Type": "application/json",
        },
        // body: JSON.stringify(formData),
      });

      if (response.status) {
        // const result = await response.json();
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
    // alert(id);
    const toastId = toast.loading("Sending data...");
    try {
      const response = await api.get(`/detail-Karyawan/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      // console.log(response.data.data.karyawan_nama);
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
          Authorization: `Bearer ${token}`, // Sisipkan token di header
          "Content-Type": "application/json",
        },
        // body: JSON.stringify(formData),
      });

      if (response.status) {
        // const result = await response.json();
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

  let [number] = useState(0);
  // handle gaji
  const [modalGaji, setModalGaji] = useState(false);
  const [dataGaji, setDataGaji] = useState([]);
  const [karyawanNama, setKaryawanNama] = useState("");
  const currentMonth = new Date().getMonth() + 1;
  const [month, setMonth] = useState(currentMonth);
  const today = new Date(); // Tanggal hari ini
  const year = today.getFullYear();
  const [yearNow, setYearNow] = useState(year);
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
  //
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
  // set bulan
  const aturBulan = async (bln) => {
    // alert(bln);
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
            Authorization: `Bearer ${token}`, // Sisipkan token di header
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
            Authorization: `Bearer ${token}`, // Sisipkan token di header
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
  //
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
  // console.log(dataGaji);
  let no = 0;
  const [tempId, setTempId] = useState([]);
  const [tempValue, setTempValue] = useState([]);
  let grandTtlGaji = 0;
  const handleInputCheckbox = async (index, event, id, beban_value) => {
    // console.log(tempId);
    const exists = tempId.some((item) => item === id);
    // console.log(exists);
    if (!exists) {
      setTempId([...tempId, id]);
      setTempValue([...tempValue, beban_value]);
    }
    //
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
            Authorization: `Bearer ${token}`, // Sisipkan token di header
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
          // getDataGaji();
        }
      } catch (error) {}
      setDataGaji(values);
    }
  };
  let ttlValTemp = 0;
  tempValue.map((item) => {
    ttlValTemp += parseInt(item);
  });
  // console.log(ttlValTemp);
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(date);
  };
  // data bulan
  const dataBulan = {
    1: "Januari",
    2: "Februari",
    3: "Maret",
    4: "April",
    5: "Mei",
    6: "Juni",
    7: "Juli",
    8: "Agustus",
    9: "September",
    10: "Oktober",
    11: "November",
    12: "Desember",
  };

  // PRINT
  const handlePrint = async () => {
    // if (tempId.length <= 0) {
    //   alert("Minimal centang 1 data");
    //   return;
    // }
    try {
      // ESC/POS Commands
      const ESC = "\x1B";
      const fontSmall = `${ESC}!\x01`; // Ukuran font kecil
      let params = {
        idKaryawan: idKaryawan,
        from: dateFrom,
        to: dateTo,
      };
      // Data nota
      const response = await api.post("/gaji-print", params, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      //get response data
      const data = await response.data;
      const items = data.gaji;
      const currentDateTime = getCurrentDateTime(); // Ambil tanggal dan jam sekarang

      // Format kolom
      const columnWidths = [5, 15, 26]; // Lebar kolom untuk nama, tonase, dan harga
      // Format header
      const header =
        `${fontSmall}` + // Atur font kecil
        "Putra Cabe\n" +
        "Alamat Jln. Raya Bandongan - Magelang\nPaingan Trasan, Bandongan\n" +
        "HP. 0813 1300 5249 / 0813 9123 1224" +
        "\n-----------------------------------------------\n" +
        `Karyawan    : ${data.karyawan.karyawan_nama}\n` +
        `Nota Cetak  : ${currentDateTime[0]}\n` + // Tambahkan tanggal dan jam sekarang
        `Nota Jam    : ${currentDateTime[1]}\n` + // Tambahkan tanggal dan jam sekarang
        "-----------------------------------------------\n" +
        formatRow(["No", "Tangal", "Gaji"], columnWidths) +
        "\n" +
        "-----------------------------------------------\n";

      // Format isi tabel
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
      items.map((data) => {
        gttl += parseInt(data.beban_value);
      });
      // Format footer
      const footer =
        "-----------------------------------------------\n" +
        formatRow(["Grand Total", formatRupiah(gttl)], [21, 26]) +
        "\n-----------------------------------------------\n\n";

      // Gabungkan semuanya
      // const nota = header + rows + "\n" + footer;
      const nota =
        `${fontSmall}` + header + rows + "\n" + footer + `${fontSmall}`; // Kembalikan ke font normal jika perlu

      console.log(nota); // Debug: lihat output di konsol

      // Kirim ke printer thermal
      const printData = new TextEncoder().encode(nota);

      // Hubungkan ke perangkat Bluetooth
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
      });

      console.log("Perangkat ditemukan:", device.name);

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(
        "000018f0-0000-1000-8000-00805f9b34fb"
      );
      const characteristic = await service.getCharacteristic(
        "00002af1-0000-1000-8000-00805f9b34fb"
      );

      // Kirim data ke printer
      console.log("Data size:", printData.byteLength);
      // await characteristic.writeValue(printData);
      // mambagi dua
      function chunkArrayBuffer(buffer, chunkSize) {
        let chunks = [];
        for (let i = 0; i < buffer.byteLength; i += chunkSize) {
          chunks.push(buffer.slice(i, i + chunkSize));
        }
        return chunks;
      }

      async function sendDataInChunks(characteristic, data) {
        const chunkSize = 512; // Batas maksimum byte
        const chunks = chunkArrayBuffer(data, chunkSize);

        for (const chunk of chunks) {
          await characteristic.writeValue(chunk);
          // Tunggu sedikit waktu jika perangkat memerlukan jeda
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }
      // end membagi dua
      await sendDataInChunks(characteristic, printData);
      console.log("Nota berhasil dicetak.");
      setTempId([]);
      setTempValue([]);
    } catch (error) {
      console.error("Gagal mencetak nota:", error);
    }
    // console.log(response);
  };

  // Fungsi untuk mengonversi bitmap ke format ESC/POS
  function convertBitmapToESCPOS(bitmap) {
    let commands = [];
    const ESC = "\x1B";
    const bytesPerRow = Math.ceil(bitmap[0].length / 8);

    for (let row of bitmap) {
      let rowData = [];
      for (let i = 0; i < bytesPerRow; i++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          if (row[i * 8 + bit]) {
            byte |= 1 << (7 - bit);
          }
        }
        rowData.push(byte);
      }
      commands.push(String.fromCharCode(...rowData));
    }

    // ESC * m nL nH data
    const width = bitmap[0].length;
    const height = bitmap.length;
    const nL = width & 0xff;
    const nH = (width >> 8) & 0xff;
    return `${ESC}*0${String.fromCharCode(nL, nH)}${commands.join("")}`;
  }

  function getCurrentDateTime() {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    const tanggal = now.toLocaleDateString("id-ID", options); // Format: "Kamis, 16 November 2024"
    const jam = now.toLocaleTimeString("id-ID"); // Format: "13:45:30" atau sesuai lokal
    // return `${tanggal} ${jam}`;
    return [tanggal, jam];
  }

  // Fungsi untuk memformat baris teks
  function formatRow(columns, columnWidths) {
    return columns
      .map((col, index) => {
        const width = columnWidths[index];
        return col.toString().padEnd(width, " "); // Tambahkan spasi untuk alignment
      })
      .join(" ");
  }

  // Fungsi untuk memformat angka ke rupiah
  function formatRupiah(angka) {
    return `Rp${angka.toLocaleString("id-ID")}`;
  }
  //
  return (
    <>
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
              <h3
                className="text-gray-500 text-xs xl:text-md cursor-pointer border-l-2 px-2"
                onClick={() => handleTab("tambah-pengiriman")}
              >
                Pengiriman
              </h3>
              <h3 className="text-colorBlue text-sm xl:text-lg font-bold ">
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
            <button
              className="bg-colorBlue text-colorGray py-1 px-2 rounded-sm my-1 font-poppins text-sm"
              type="button"
              onClick={() => handleModalAdd()}
            >
              <i className="fa fa-plus text-sm"></i> Tambah
            </button>
          </div>
          <div className="h-[94%] md:h-[95%] ">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <React.Fragment key="table-k">
                    <tr className="w-full text-white text-center font-poppins text-sm bg-colorBlue">
                      <th className="border border-black md:w-[5%]">No</th>
                      <th className="border border-black md:w-[80%]">
                        Nama Karyawan
                      </th>
                      <th className="border border-black md:w-[15%]"></th>
                    </tr>
                  </React.Fragment>
                </thead>
                <tbody>
                  {datas &&
                    datas.map((item, key) => {
                      number++;
                      return (
                        <>
                          <tr
                            key={item.suplier_id}
                            className={`${
                              number % 2 === 0 ? "bg-gray-50" : "bg-gray-200"
                            }`}
                          >
                            <td className="border border-black text-center cursor-pointer">
                              {number}
                            </td>
                            <td className="border border-black text-left cursor-pointer px-2 py-1">
                              {item.karyawan_nama}
                            </td>
                            <td className="border border-black text-center cursor-pointer">
                              <div className="text-center">
                                <i
                                  onClick={() => handleGaji(item.id)}
                                  className="fa fa-credit-card"
                                ></i>
                                <i
                                  onClick={() => handleEdit(item.id)}
                                  className="fa fa-edit mx-2"
                                ></i>
                              </div>
                            </td>
                          </tr>
                        </>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
      {stModalAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
          <div className="bg-white w-3/4 h-[90%] xl:w-1/2 xl:h-[50%] p-6 rounded-lg shadow-lg relative z-10">
            <div className="w-full h-[10%]">
              <h2 className="text-xl font-semibold mb-2 text-colorBlue font-poppins">
                Tambah Karyawan
              </h2>
              <div className="h-[2px] w-full bg-colorBlue mb-4"></div>
            </div>
            <div className="w-full h-[80%] overflow-auto">
              <form onSubmit={handleSubmit}>
                <div className="flex justify-around mt-5 items-center">
                  <p className="w-1/3 md:w-1/4">Nama Karyawan</p>
                  <p>:</p>
                  <input
                    className="border-2 px-1 py-1 w-1/3 md:w-1/2"
                    name="karyawan_nama"
                    value={formData.karyawan_nama}
                    onChange={handleChange}
                  />
                </div>
                <button
                  class="mt-5 py-1 px-2 bg-green-700 font-poppins text-colorGray rounded hover:bg-green-900"
                  type="submit"
                >
                  <i class="fa fa-save"></i> Simpan
                </button>
              </form>
            </div>
            <div className="w-full h-[10%]">
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-colorGray border-2 border-colorBlue font-poppins text-colorBlue rounded hover:bg-slate-200"
                  onClick={() => handleModalAdd()}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {stModalEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
          <div className="bg-white w-3/4 h-[90%] xl:w-1/2 xl:h-[70%] p-6 rounded-lg shadow-lg relative z-10">
            <div className="w-full h-[10%]">
              <h2 className="text-xl font-semibold mb-2 text-colorBlue font-poppins">
                Ubah Karyawan
              </h2>
              <div className="h-[2px] w-full bg-colorBlue mb-4"></div>
            </div>
            <div className="w-full h-[80%] overflow-auto">
              <form onSubmit={handleSubmitEdit}>
                <input type="hidden" value={formData.id} />
                <div className="flex justify-around mt-5 items-center">
                  <p className="w-1/3 md:w-1/4">Nama Karyawan</p>
                  <p>:</p>
                  <input
                    className="border-2 px-1 py-1 w-1/3 md:w-1/2"
                    name="karyawan_nama"
                    value={formData.karyawan_nama}
                    onChange={handleChange}
                  />
                </div>
                <button
                  class="mt-5 py-1 px-2 bg-green-700 font-poppins text-colorGray rounded hover:bg-green-900"
                  type="submit"
                >
                  <i class="fa fa-save"></i> Simpan
                </button>
              </form>
            </div>
            <div className="w-full h-[10%]">
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-colorGray border-2 border-colorBlue font-poppins text-colorBlue rounded hover:bg-slate-200"
                  onClick={() => handleModalEdit()}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {modalGaji && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
          <div className="bg-white w-[90%] h-[90%] xl:w-1/2 xl:h-[90%] p-6 rounded-lg shadow-lg relative z-10">
            <div className="w-full h-[10%]">
              <h2 className="text-xl font-semibold mb-2 text-colorBlue font-poppins">
                {karyawanNama}
              </h2>
              <div className="h-[2px] w-full bg-colorBlue mb-4"></div>
            </div>
            <div className="w-full h-[80%] overflow-auto">
              <div className="flex justify-between mb-2 ">
                <div className="flex gap-1">
                  <input
                    name="dateFrom"
                    type="date"
                    className="w-20 md:w-36 border-2 md:py-1 px-1 md:px-3 rounded-md border-colorBlue text-xs md:text-sm"
                    placeholder="Dari"
                    value={dateFrom}
                    onChange={(event) => handleInputChange(event)}
                  ></input>
                  <p className="hidden md:block">Sampai</p>
                  <input
                    name="dateTo"
                    type="date"
                    className="w-20 md:w-36 border-2 md:py-1 px-1 md:px-3 rounded-md border-colorBlue text-xs md:text-sm"
                    placeholder="Dari"
                    value={dateTo}
                    onChange={(event) => handleInputChange(event)}
                  ></input>
                </div>

                {/* <div className="font-poppins">
                  <select
                    className="border border-black py-1 px-2 w-3/4"
                    onChange={(event) => aturBulan(event.target.value)}
                  >
                    <option value="">Pilih Bulan</option>
                    {Object.values(dataBulan).map((item, index) => {
                      return (
                        <option
                          selected={index + 1 === month}
                          value={index + 1}
                        >
                          {item}
                        </option>
                      );
                    })}
                  </select>
                </div> */}
                <div>
                  <button
                    onClick={handlePrint}
                    className="bg-yellow-500 text-white text-sm md:text-md font-poppins py-1 px-2 rounded-sm"
                  >
                    <i className="fa fa-print"></i> Slip Gaji
                  </button>
                </div>
              </div>
              {/* <img src={quick} id="logo" alt="quick" className="w-40 mx-auto" /> */}
              <table className="w-full font-poppins text-xs xl:text-md">
                <thead>
                  <tr className="w-full text-white text-center font-poppins text-xs xl:text-md bg-colorBlue">
                    <th className="border border-black py-1 px-2">No</th>
                    <th className="border border-black py-1 px-2">Tanggal</th>
                    <th className="border border-black py-1 px-2">Gaji</th>
                    <th className="border border-black py-1 px-2">Status</th>
                    <th className="border border-black py-1 px-2">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {dataGaji &&
                    dataGaji.map((item, index) => {
                      no++;
                      grandTtlGaji += parseInt(item.beban_value);
                      return (
                        <>
                          <tr key={item.id}>
                            <td className="border border-black py-1 px-2 text-center">
                              {no}
                            </td>
                            <td className="border border-black py-1 px-2 ">
                              {FormatTanggal(item.beban_tgl)}
                            </td>
                            <td className="border border-black py-1 px-2 text-right">
                              {RupiahFormat(item.beban_value)}
                            </td>
                            <td className="border border-black py-1 px-2 text-center">
                              <input
                                type="checkbox"
                                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
                                name="beban_st"
                                value={item.beban_st === "yes" ? "no" : "yes"}
                                // value={field.pembelian_harga}
                                onChange={(event) =>
                                  handleInputCheckbox(
                                    index,
                                    event,
                                    item.id,
                                    item.beban_value
                                  )
                                }
                                disabled={item.beban_st === "yes"}
                                checked={item.beban_st === "yes"}
                              ></input>
                            </td>
                            <td className="border border-black py-1 px-2 text-center">
                              {formatDate(item.updated_at)}
                            </td>
                          </tr>
                        </>
                      );
                    })}
                  <tr key="ttlgaji">
                    <td
                      className="border border-black py-1 px-2 text-center"
                      colSpan="2"
                    >
                      Total
                    </td>
                    <td className="border border-black py-1 px-2 text-right">
                      {RupiahFormat(grandTtlGaji)}
                    </td>
                    <td className="border border-black py-1 px-2 text-center">
                      {/* {RupiahFormat(ttlValTemp)} */}
                    </td>
                    <td className="border border-black py-1 px-2 text-center"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="w-full h-[10%]">
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-colorGray border-2 border-colorBlue font-poppins text-colorBlue rounded hover:bg-slate-200"
                  onClick={() => closeGaji()}
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

export default TambahKaryawan;
