import React, { useState } from "react";
import RupiahFormat from "../utilities/RupiahFormat";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import api from "../utilities/axiosInterceptor";
import FormatTanggal from "../utilities/FormatTanggal";

function TambahPembelian() {
  // TOKEN
  const token = localStorage.getItem("token");
  //
  const [suplier_nama, setsuplier_nama] = useState("");
  const [suplier_tgl, setsuplier_tgl] = useState("");
  //
  const handleSuplier_nama = (event) => {
    setsuplier_nama(event.target.value);
  };
  //
  const handleSuplier_tgl = (event) => {
    setsuplier_tgl(event.target.value);
  };

  const [inputFields, setInputFields] = useState([
    {
      pembayaran: "",
      pembelian_nama: "",
      pembelian_kotor: "",
      pembelian_potongan: "",
      pembelian_bersih: "",
      pembelian_harga: "",
      pembelian_total: "",
    },
  ]);

  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      {
        pembayaran: "",
        pembelian_nama: "",
        pembelian_kotor: "",
        pembelian_potongan: "",
        pembelian_bersih: "",
        pembelian_harga: "",
        pembelian_total: "",
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
    const btnValue = event.nativeEvent.submitter.value; // Mendapatkan nilai button yang di-klik
    event.preventDefault();
    const isConfirmed = window.confirm(
      "Apakah Anda yakin ingin menyimpan data ini?",
    );
    if (isConfirmed) {
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
        const data = { suplier_nama: suplier_nama, suplier_tgl: suplier_tgl };
        let params = {
          formData: inputFields,
          suplierData: data,
          type: btnValue,
        };
        let response = "";
        if (btnValue === "simcetak") {
          response = await api.post(`/add-Pembelian`, params, {
            // headers: {
            //   Authorization: `Bearer ${token}`, // Sisipkan token di header
            // },
            // responseType: "blob", // penting untuk men-download file
            headers: {
              Authorization: `Bearer ${token}`, // Sisipkan token di header
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
          try {
            // ESC/POS Commands
            const ESC = "\x1B";
            const fontSmall = `${ESC}!\x01`; // Ukuran font kecil

            // Data nota
            const supplier = response.data.suplierData.suplier_nama;
            const tanggal = FormatTanggal(
              response.data.suplierData.suplier_tgl,
            );
            const items = response.data.data.formData;
            const currentDateTime = getCurrentDateTime(); // Ambil tanggal dan jam sekarang
            //   console.log(supplier);
            //   console.log(tanggal);
            //   console.log(items);
            const grandTotal = items.reduce(
              (sum, item) => sum + parseInt(item.pembelian_total),
              0,
            );

            // Format kolom
            const columnWidths = [6, 9, 16, 16]; // Lebar kolom untuk nama, tonase, dan harga

            // Format header
            const header =
              `${fontSmall}` + // Atur font kecil
              "Putra Cabe\n" +
              "Alamat Jln. Raya Bandongan - Magelang\nPaingan Trasan, Bandongan\n" +
              "HP. 0813 1300 5249 / 0813 9123 1224" +
              "\n-----------------------------------------------\n" +
              `Supplier    : ${supplier}\n` +
              `Tanggal     : ${tanggal}\n` +
              `Nota Cetak  : ${currentDateTime[0]}\n` + // Tambahkan tanggal dan jam sekarang
              `Nota Jam    : ${currentDateTime[1]}\n` + // Tambahkan tanggal dan jam sekarang
              "-----------------------------------------------\n" +
              formatRow(["Brg", "Ton", "Harga", "Total"], columnWidths) +
              "\n" +
              "-----------------------------------------------\n";

            // Format isi tabel
            const rows = items
              .map((item) =>
                formatRow(
                  [
                    item.pembelian_nama,
                    item.pembelian_kotor.toString() +
                      "|" +
                      item.pembelian_bersih.toString(),
                    formatRupiah(parseInt(item.pembelian_harga)),
                    formatRupiah(parseInt(item.pembelian_total)),
                  ],
                  columnWidths,
                ),
              )
              .join("\n");

            // Format footer
            const footer =
              "-----------------------------------------------\n" +
              formatRow(["Grand Total", formatRupiah(grandTotal)], [33, 16]) +
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
              "000018f0-0000-1000-8000-00805f9b34fb",
            );
            const characteristic = await service.getCharacteristic(
              "00002af1-0000-1000-8000-00805f9b34fb",
            );

            // Kirim data ke printer
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
          } catch (error) {
            console.error("Gagal mencetak nota:", error);
          }
          // console.log(response);
          // console.log(response.data);
          // // Membuat URL untuk file yang didownload
          // const url = window.URL.createObjectURL(new Blob([response.data]));
          // // alert(url);
          // const link = document.createElement("a");
          // link.href = url;
          // link.setAttribute("download", "Pembelian.png"); // Nama file untuk diunduh
          // document.body.appendChild(link);
          // link.click(); // Memicu download
          // document.body.removeChild(link); // Menghapus link setelah download
        } else {
          response = await api.post("/add-Pembelian", params, {
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
          setsuplier_nama("");
          setsuplier_tgl("");
          setInputFields([
            {
              pembayaran: "",
              pembelian_nama: "",
              pembelian_kotor: "",
              pembelian_potongan: "",
              pembelian_bersih: "",
              pembelian_harga: "",
              pembelian_total: "",
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
    } else {
    }

    // console.log("inputFields:", inputFields);
  };
  const navigate = useNavigate();
  const handleTab = (event) => {
    navigate(`/${event}`);
  };

  let number = 0;

  const handleInputCheckbox = (index, event) => {
    const values = [...inputFields];
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

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

  let resTtlPembwlian = 0;
  const grandTotalPembelian = () => {
    inputFields.map((val, index) => {
      resTtlPembwlian += val.pembelian_total;
    });
  };
  grandTotalPembelian();
  //
  return (
    <div className="p-1 md:p-2 xl:p-7">
      <div className=" w-full h-full mx-auto bg-gray-50 shadow-xl p-5">
        <div className="h-fit xl:flex items-center mb-1 xl:mb-4 justify-between">
          <div className="font-poppins font-normal grid grid-cols-2 md:flex gap-1 xl:gap-4 items-center">
            <h3 className="text-colorBlue text-sm xl:text-lg  font-semibold border-l-2 px-2">
              Pembelian
            </h3>
            <h3
              className="text-gray-500 text-xs xl:text-md cursor-pointer border-l-2 px-2"
              onClick={() => handleTab("tambah-pengiriman")}
            >
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
        <div className="h-auto">
          <form onSubmit={handleSubmit} className="h-fit overflow-y-auto">
            <div className="md:grid md:grid-cols-2 md:gap-10 md:mb-2">
              <div className="flex text-sm xl:text-md font-poppins items-center my-1 xl:my-2">
                <p className="w-fit">Nama Suplier : </p>
                <input
                  className="border ml-5 px-2 py-1 w-1/2"
                  placeholder="Nama Suplier"
                  name="suplier_nama"
                  value={suplier_nama}
                  onChange={handleSuplier_nama}
                  required
                ></input>
              </div>
              <div className="flex text-sm xl:text-md font-poppins items-center my-1 xl:my-2">
                <p className="w-fit">Tanggal : </p>
                <input
                  type="date"
                  className="border ml-5 px-2 py-1 w-1/2"
                  placeholder="Nama Suplier"
                  name="suplier_tgl"
                  value={suplier_tgl}
                  onChange={handleSuplier_tgl}
                  required
                ></input>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-[115%] xl:w-full font-poppins text-xs xl:text-md">
                <thead className="">
                  <tr className="w-full text-white text-center font-poppins text-xs xl:text-md bg-colorBlue">
                    <th className="border border-black md:w-[5%]">No</th>
                    <th className="border border-black md:w-[13%]">
                      Nama Barang
                    </th>
                    <th className="border border-black md:w-[10%]">
                      Tonase Kotor
                    </th>
                    <th className="border border-black md:w-[8%]">Potongan</th>
                    <th className="border border-black md:w-[8%]">
                      Tonase Bersih
                    </th>
                    <th className="border border-black md:w-[10%]">
                      Pembayaran
                    </th>
                    <th className="border border-black md:w-[20%]">Harga</th>
                    <th className="border border-black md:w-[15%]">Total</th>
                    <th className="border border-black md:w-[5%]"></th>
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
                          <input
                            required
                            name="pembelian_nama"
                            className="border m-2 w-24 md:w-3/4 p-1"
                            value={field.pembelian_nama}
                            onChange={(event) =>
                              handleInputChange(index, event)
                            }
                          ></input>
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
                        <td className="border border-black px-2 text-center">
                          <div className="flex w-full gap-2 mx-auto">
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
                            type="number"
                            className={`border m-2 w-24 md:w-3/4 p-1`}
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
                          <input
                            type="text"
                            className="border py-1 px-2 m-2 w-24 md:w-3/4 bg-slate-300"
                            name="pembelian_total"
                            value={RupiahFormat(field.pembelian_total)}
                            readOnly
                            required
                          ></input>
                        </td>
                        <td className="border border-black">
                          {number === 1 ? (
                            <button
                              className={` bg-red-400 text-colorGray py-1 px-2 rounded-md my-1 font-sm md:font-normal`}
                              type="button"
                              disabled
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          ) : (
                            <button
                              className={` bg-red-600 text-colorGray py-1 px-2 rounded-md my-1 font-sm md:font-normal`}
                              type="button"
                              onClick={() => handleRemoveField(index)}

                              // { inputFields.length === 1 ? "" : ""}
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td
                      className="border border-black text-right py-1 px-2 font-poppins"
                      colSpan="7"
                    >
                      <p className="font-bold">Grand Total</p>
                    </td>
                    {/* <td className="border border-black  ">
                      <input
                        type="text"
                        className="border m-2 w-24 md:w-3/4 bg-slate-300"
                        value={RupiahFormat(resTtlPembwlian)}
                        readOnly
                      ></input>
                    </td> */}
                    <td className="border border-black text-center">
                      <input
                        type="text"
                        className="border py-1 px-2 m-2 w-24 md:w-3/4 text-red-500 font-bold"
                        value={RupiahFormat(resTtlPembwlian)}
                        readOnly
                      ></input>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="w-full mt-2 xl:mt-5">
              <div className="flex gap-3 justify-end">
                <button
                  className="py-1 px-2 text-sm xl:text-md bg-blue-500 font-poppins text-colorGray rounded hover:bg-green-900"
                  type="submit"
                  value="simcetak"
                  name="type_submit"
                >
                  <i className="fa fa-print"></i> Simpan & Cetak
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
            </div>
          </form>
          <div className="h-fit">
            <button
              className="bg-colorBlue text-sm xl:text-md text-colorGray py-1 px-2 rounded-sm my-1 font-poppins"
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

export default TambahPembelian;
