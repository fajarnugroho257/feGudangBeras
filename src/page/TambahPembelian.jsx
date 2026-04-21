import React, { useState, useEffect, useCallback } from "react";
import RupiahFormat from "../utilities/RupiahFormat";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import api from "../utilities/axiosInterceptor";
import FormatTanggal from "../utilities/FormatTanggal";
import Select from 'react-select';

function TambahPembelian() {
  // TOKEN
  const token = localStorage.getItem("token");
  //
  const [suplier_nama, setsuplier_nama] = useState("");
  const [pembelian_tgl, setpembelian_tgl] = useState("");
  const [alamat, setalamat] = useState("");
  const [no_hp, setno_hp] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierOptions, setSupplierOptions] = useState([{ value: 'new', label: 'Suplier Baru' }]);
  const [barangOptionsCache, setBarangOptionsCache] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await api.get('/get-suplier', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200 && Array.isArray(response.data.dataSuplier)) {
          const options = response.data.dataSuplier.map((item) => ({
            value: item.id,
            label: item.suplier_nama,
          }));
          setSupplierOptions([...options, { value: 'new', label: 'Suplier Baru' }]);
        }
      } catch (error) {
        console.error('Failed to fetch suppliers:', error);
      }
    };

    fetchSuppliers();
  }, [token]);

  const fetchBarangByType = useCallback(
    async (tipe) => {
      if (barangOptionsCache[tipe]) {
        return; // Already cached
      }

      try {
        const response = await api.get('/get-barang', {
          params: { tipe },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200 && Array.isArray(response.data.dataBarang)) {
          const options = response.data.dataBarang.map((item) => ({
            value: item.id,
            label: item.nama,
          }));

          setBarangOptionsCache((prev) => ({
            ...prev,
            [tipe]: options,
          }));
        }
      } catch (error) {
        console.error(`Failed to fetch barang for type ${tipe}:`, error);
      }
    },
    [barangOptionsCache, token],
  );

  useEffect(() => {
    fetchBarangByType('beras');
    fetchBarangByType('gabah');
  }, [fetchBarangByType]);
  //
  const handleSuplier_nama = (event) => {
    setsuplier_nama(event.target.value);
  };
  //
  const handlePembelian_tgl = (event) => {
    setpembelian_tgl(event.target.value);
  };
  const handleAlamat = (event) => {
    setalamat(event.target.value);
  };
  const handleNo_hp = (event) => {
    setno_hp(event.target.value);
  };

  const [inputFields, setInputFields] = useState([
    {
      pembayaran: "",
      barang_id: "",
      barang_nama: "",
      barang_tipe: "beras",
      pembelian_kotor: "",
      pembelian_potongan: "0",
      pembelian_bersih: "",
      pembelian_harga: "",
      pembelian_total: "",
      pembelian_nota_st: "no",
      selectedBarang: null,
    },
  ]);

  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      {
        pembayaran: "cash",
        barang_id: "",
        barang_nama: "",
        barang_tipe: "beras",
        pembelian_kotor: "",
        pembelian_potongan: "",
        pembelian_bersih: "",
        pembelian_harga: "",
        pembelian_total: "",
        pembelian_nota_st: "no",
        selectedBarang: null,
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

    // If barang_tipe changed, fetch barang for that type
    if (event.target.name === 'barang_tipe') {
      fetchBarangByType(event.target.value);
    }

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

    if (isSubmitting) return; // ✅ cegah double click

    setIsSubmitting(true); // lock

    const isConfirmed = window.confirm(
      "Apakah Anda yakin ingin menyimpan data ini?",
    );
    if (isConfirmed) {
      if (!selectedSupplier) {
        setIsSubmitting(false);
        alert("Pilih Supplier");
        return;
      }
      if (selectedSupplier.value === 'new' && !suplier_nama) {
        setIsSubmitting(false);
        alert("Nama Suplier harus diisi");
        return;
      }
      if (!pembelian_tgl) {
        setIsSubmitting(false);
        alert("Tanggal harus diisi");
        return;
      }
      const invalidItem = inputFields.find(
        (item) => !item.selectedBarang || (item.selectedBarang.value === 'new' && !item.barang_nama),
      );
      if (invalidItem) {
        setIsSubmitting(false);
        alert("Setiap item harus memiliki Barang yang dipilih, dan jika Barang Baru, nama harus diisi.");
        return;
      }
      const toastId = toast.loading("Sending data...");
      try {
        const data = {
          suplier_id: selectedSupplier.value === 'new' ? null : selectedSupplier.value,
          suplier_nama: selectedSupplier.value === 'new' ? suplier_nama : null,
          pembelian_tgl: pembelian_tgl,
          alamat: selectedSupplier.value === 'new' ? alamat : null,
          no_hp: selectedSupplier.value === 'new' ? no_hp : null,
        };
        const sanitizedFields = inputFields.map(item => ({
          ...item,
          barang_id: item.selectedBarang?.value === 'new'
            ? null
            : item.barang_id
        }));
        let params = {
          formData: sanitizedFields,
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
            const supplier = suplier_nama;
            const tanggal = FormatTanggal(pembelian_tgl);
            const items = inputFields;
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
                    item.barang_id,
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
          setpembelian_tgl("");
          setalamat("");
          setno_hp("");
          setSelectedSupplier(null);
          setInputFields([
            {
              pembayaran: "",
              barang_id: "",
              barang_nama: "",
              pembelian_kotor: "",
              pembelian_potongan: "",
              pembelian_bersih: "",
              pembelian_harga: "",
              pembelian_total: "",
              pembelian_nota_st: "no",
              selectedBarang: null,
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
      } finally {
        setIsSubmitting(false); // unlock (WAJIB)
      }
    } else {
      setIsSubmitting(false);
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
    if (event.target.type === 'checkbox') {
      values[index][event.target.name] = event.target.checked ? event.target.value : 'no';
    } else {
      values[index][event.target.name] = event.target.value;
    }
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

  const resTtlPembwlian = inputFields.reduce(
    (sum, val) => sum + Number(val.pembelian_total || 0),
    0,
  );
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 md:mb-4">
              {/* Supplier Select */}
              <div className="flex flex-col md:flex-row md:items-center font-poppins py-1">
                <label className="text-sm xl:text-base font-medium text-gray-700 w-32">
                  Supplier
                </label>
                <div className="flex-1 md:ml-5">
                  <Select
                    value={selectedSupplier}
                    onChange={setSelectedSupplier}
                    options={supplierOptions}
                    placeholder="Pilih Supplier"
                    isClearable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      control: (base) => ({
                        ...base,
                        borderRadius: '0.375rem',
                        borderColor: '#d1d5db',
                        minHeight: '38px'
                      }),
                    }}
                  />
                </div>
              </div>

              {/* Tanggal Pembelian */}
              <div className="flex flex-col md:flex-row md:items-center font-poppins py-1">
                <label className="text-sm xl:text-base font-medium text-gray-700 w-32">
                  Tanggal
                </label>
                <div className="flex-1 md:ml-5">
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-[6px] text-sm focus:outline-none focus:ring-2 focus:ring-colorBlue focus:border-transparent transition-all"
                    name="pembelian_tgl"
                    value={pembelian_tgl}
                    onChange={handlePembelian_tgl}
                    required
                  />
                </div>
              </div>

              {/* Kondisional: Supplier Baru */}
              {selectedSupplier && selectedSupplier.value === 'new' && (
                <>
                  <div className="flex flex-col md:flex-row md:items-center font-poppins py-1">
                    <label className="text-sm xl:text-base font-medium text-gray-700 w-32">
                      Nama Supplier
                    </label>
                    <div className="flex-1 md:ml-5">
                      <input
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-colorBlue transition-all"
                        placeholder="Masukkan nama supplier"
                        name="suplier_nama"
                        value={suplier_nama}
                        onChange={handleSuplier_nama}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center font-poppins py-1">
                    <label className="text-sm xl:text-base font-medium text-gray-700 w-32">
                      No HP
                    </label>
                    <div className="flex-1 md:ml-5">
                      <input
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-colorBlue transition-all"
                        placeholder="0812..."
                        name="no_hp"
                        value={no_hp}
                        onChange={handleNo_hp}
                      />
                    </div>
                  </div>

                  {/* Alamat dibuat full width (opsional) atau tetap dalam grid */}
                  <div className="flex flex-col md:flex-row md:items-start font-poppins py-1 md:col-span-2">
                    <label className="text-sm xl:text-base font-medium text-gray-700 w-32 md:mt-2">
                      Alamat
                    </label>
                    <div className="flex-1 md:ml-5">
                      <textarea
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-colorBlue transition-all"
                        placeholder="Alamat lengkap supplier"
                        name="alamat"
                        rows="2"
                        value={alamat}
                        onChange={handleAlamat}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-[115%] xl:w-full font-poppins text-xs xl:text-sm">
                <thead>
                  <tr className="w-full text-white text-center font-poppins bg-colorBlue">
                    <th className="border border-black md:w-[3%]">No</th>
                    <th className="border border-black md:w-[8%]">Tipe</th>
                    <th className="border border-black md:w-[12%]">Pilih Barang</th>
                    <th className="border border-black md:w-[12%]">Nama Barang</th>
                    <th className="border border-black md:w-[8%]">Tonase Kotor</th>
                    <th className="border border-black md:w-[7%]">Potongan</th>
                    <th className="border border-black md:w-[8%]">Tonase Bersih</th>
                    <th className="border border-black md:w-[10%]">Pembayaran</th>
                    {/* Kolom Harga diperlebar menjadi 20% */}
                    <th className="border border-black md:w-[20%]">Harga (Rp)</th>
                    {/* Kolom Total diperlebar menjadi 15% */}
                    <th className="border border-black md:w-[15%]">Total</th>
                    <th className="border border-black md:w-[4%]">Nota</th>
                    <th className="border border-black md:w-[3%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {inputFields.map((field, index) => {
                    number++;
                    return (
                      <tr
                        key={index}
                        className={`text-center hover:bg-blue-50 ${number % 2 === 0 ? "bg-gray-50" : "bg-gray-200"
                          }`}
                      >
                        <td className="border border-black">{number}</td>
                        <td className="border border-black">
                          <div className="m-1">
                            <select
                              className="border w-full p-1"
                              name="barang_tipe"
                              value={field.barang_tipe}
                              onChange={(event) => handleInputChange(index, event)}
                            >
                              <option value="beras">Beras</option>
                              <option value="gabah">Gabah</option>
                            </select>
                          </div>
                        </td>
                        <td className="border border-black">
                          <div className="p-1">
                            <Select
                              value={field.selectedBarang}
                              onChange={(selected) => {
                                const values = [...inputFields];
                                values[index].selectedBarang = selected;
                                values[index].barang_id =
                                  selected && selected.value !== 'new' ? selected.value : null;
                                setInputFields(values);
                              }}
                              options={barangOptionsCache[field.barang_tipe] ? [...barangOptionsCache[field.barang_tipe], { value: 'new', label: 'Barang Baru' }] : [{ value: 'new', label: 'Barang Baru' }]}
                              placeholder="Cari..."
                              isClearable
                              menuPortalTarget={document.body}
                              styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                control: (base) => ({ ...base, minHeight: '30px', fontSize: '12px' })
                              }}
                            />
                          </div>
                        </td>
                        <td className="border border-black">
                          {field.selectedBarang && field.selectedBarang.value === 'new' ? (
                            <input
                              name="barang_nama"
                              className="border p-1 w-11/12"
                              placeholder="Nama Baru"
                              value={field.barang_nama}
                              onChange={(event) => handleInputChange(index, event)}
                              required
                            />
                          ) : (
                            <span className="text-gray-400 italic">Otomatis</span>
                          )}
                        </td>
                        <td className="border border-black">
                          <input
                            type="number"
                            className="border p-1 w-11/12"
                            name="pembelian_kotor"
                            value={field.pembelian_kotor}
                            onChange={(event) => handleInputChangePembelianKotor(index, event)}
                            required
                          />
                        </td>
                        <td className="border border-black">
                          <input
                            type="number"
                            className="border p-1 w-11/12"
                            name="pembelian_potongan"
                            value={field.pembelian_potongan}
                            onChange={(event) => handleInputChangePembelianPotongan(index, event)}
                          />
                        </td>
                        <td className="border border-black">
                          <input
                            className="border p-1 w-11/12 bg-slate-300"
                            name="pembelian_bersih"
                            value={field.pembelian_bersih}
                            readOnly
                          />
                        </td>
                        <td className="border border-black p-2 min-w-[100px]">
                          <div className="flex bg-gray-100 rounded-lg p-1 shadow-inner">
                            {/* Opsi Cash */}
                            <label className={`flex-1 flex flex-col items-center justify-center cursor-pointer py-1 px-2 rounded-md transition-all ${field.pembayaran === "cash"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-500 hover:bg-gray-200"
                              }`}>
                              <input
                                type="radio"
                                className="hidden" // Sembunyikan radio asli
                                name={`pembayaran-${index}`}
                                value="cash"
                                onChange={(e) => handleInputChange(index, { target: { name: 'pembayaran', value: 'cash' } })}
                                checked={field.pembayaran === "cash"}
                              />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Cash</span>
                            </label>

                            {/* Opsi Hutang */}
                            <label className={`flex-1 flex flex-col items-center justify-center cursor-pointer py-1 px-2 rounded-md transition-all ${field.pembayaran === "hutang"
                                ? "bg-red-500 text-white shadow-sm"
                                : "text-gray-500 hover:bg-gray-200"
                              }`}>
                              <input
                                type="radio"
                                className="hidden" // Sembunyikan radio asli
                                name={`pembayaran-${index}`}
                                value="hutang"
                                onChange={(e) => handleInputChange(index, { target: { name: 'pembayaran', value: 'hutang' } })}
                                checked={field.pembayaran === "hutang"}
                              />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Hutang</span>
                            </label>
                          </div>
                        </td>
                        {/* INPUT HARGA DIPERLEBAR */}
                        <td className="border border-black">
                          <input
                            type="number"
                            className="border p-1 w-11/12 font-bold text-blue-700"
                            name="pembelian_harga"
                            value={field.pembelian_harga}
                            onChange={(event) => handleInputChangeHarga(index, event)}
                            required
                          />
                        </td>
                        {/* INPUT TOTAL DIPERLEBAR */}
                        <td className="border border-black">
                          <input
                            type="text"
                            className="border p-1 w-11/12 bg-slate-300 font-bold text-right"
                            value={RupiahFormat(field.pembelian_total)}
                            readOnly
                          />
                        </td>
                        <td className="border border-black">
                          <input
                            type="checkbox"
                            name="pembelian_nota_st"
                            value="yes"
                            onChange={(event) => handleInputCheckbox(index, event)}
                            checked={field.pembelian_nota_st === "yes"}
                          />
                        </td>
                        <td className="border border-black">
                          <button
                            className={`p-2 rounded-md ${index === 0 ? 'bg-red-200' : 'bg-red-600 text-white'}`}
                            type="button"
                            onClick={() => handleRemoveField(index)}
                            disabled={index === 0}
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Footer Grand Total */}
                  <tr className="bg-gray-100">
                    <td className="border border-black text-right py-2 px-4 font-bold" colSpan="9">
                      GRAND TOTAL
                    </td>
                    <td className="border border-black p-1">
                      <input
                        type="text"
                        className="w-full p-1 bg-white border border-red-500 text-red-600 font-bold text-right"
                        value={RupiahFormat(resTtlPembwlian)}
                        readOnly
                      />
                    </td>
                    <td className="border border-black" colSpan="2"></td>
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
