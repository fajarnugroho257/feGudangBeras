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
  const [pembelian_tgl, setpembelian_tgl] = useState(new Date().toISOString().slice(0, 10));
  const [alamat, setalamat] = useState("");
  const [no_hp, setno_hp] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk options
  const [supplierOptions, setSupplierOptions] = useState([{ value: 'new', label: 'Suplier Baru' }]);
  const [barangOptionsCache, setBarangOptionsCache] = useState({});
  
  // State untuk loading indicator
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingBarang, setLoadingBarang] = useState(false);

  const fetchSuppliers = async () => {
    // Jika sudah ada data (selain 'new'), jangan fetch lagi
    if (supplierOptions.length > 1 || loadingSuppliers) return;

    setLoadingSuppliers(true);
    try {
      const response = await api.get('/get-suplier', {
        headers: { Authorization: `Bearer ${token}` },
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
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const fetchBarangByType = useCallback(
    async (tipe) => {
      if (barangOptionsCache[tipe] || loadingBarang) return;

      setLoadingBarang(true);
      try {
        const response = await api.get('/get-barang', {
          params: { tipe },
          headers: { Authorization: `Bearer ${token}` },
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
      } finally {
        setLoadingBarang(false);
      }
    },
    [barangOptionsCache, token, loadingBarang],
  );


  const handleSuplier_nama = (event) => {
    setsuplier_nama(event.target.value);
  };

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
      pembayaran: "cash",
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
        pembelian_potongan: "0",
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

    // Reset barang jika tipe berubah agar user dipaksa pilih barang yang sesuai tipenya
    if (event.target.name === 'barang_tipe') {
      values[index].selectedBarang = null;
      values[index].barang_id = "";
    }

    setInputFields(values);
  };

  const handleInputChangePembelianKotor = (index, event) => {
    handleInputChangeHarga(index, event);
    const values = [...inputFields];
    if (event.target.name === "pembelian_kotor") {
      values[index]["pembelian_bersih"] =
        event.target.value - values[index]["pembelian_potongan"];
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

    if (isSubmitting) return; // cegah double click
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
          barang_id: item.selectedBarang?.value === 'new' ? null : item.barang_id
        }));
        let params = {
          formData: sanitizedFields,
          suplierData: data,
          type: btnValue,
        };
        let response = "";
        
        if (btnValue === "simcetak") {
          response = await api.post(`/add-Pembelian`, params, {
            headers: {
              Authorization: `Bearer ${token}`,
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
            const currentDateTime = getCurrentDateTime();

            const grandTotal = items.reduce(
              (sum, item) => sum + parseInt(item.pembelian_total || 0),
              0,
            );

            // Format kolom
            const columnWidths = [6, 9, 16, 16]; 

            // Format header
            const header =
              `${fontSmall}` +
              "Putra Cabe\n" +
              "Alamat Jln. Raya Bandongan - Magelang\nPaingan Trasan, Bandongan\n" +
              "HP. 0813 1300 5249 / 0813 9123 1224" +
              "\n-----------------------------------------------\n" +
              `Supplier    : ${supplier}\n` +
              `Tanggal     : ${tanggal}\n` +
              `Nota Cetak  : ${currentDateTime[0]}\n` + 
              `Nota Jam    : ${currentDateTime[1]}\n` + 
              "-----------------------------------------------\n" +
              formatRow(["Brg", "Ton", "Harga", "Total"], columnWidths) +
              "\n" +
              "-----------------------------------------------\n";

            // Format isi tabel
            const rows = items
              .map((item) =>
                formatRow(
                  [
                    item.barang_id, // Ganti ini jika perlu
                    item.pembelian_kotor.toString() + "|" + item.pembelian_bersih.toString(),
                    formatRupiah(parseInt(item.pembelian_harga || 0)),
                    formatRupiah(parseInt(item.pembelian_total || 0)),
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

            const nota = `${fontSmall}` + header + rows + "\n" + footer + `${fontSmall}`; 
            console.log(nota); 

            // Kirim ke printer thermal
            const printData = new TextEncoder().encode(nota);
            const device = await navigator.bluetooth.requestDevice({
              acceptAllDevices: true,
              optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
            });
            console.log("Perangkat ditemukan:", device.name);

            const server = await device.gatt.connect();
            const service = await server.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb");
            const characteristic = await service.getCharacteristic("00002af1-0000-1000-8000-00805f9b34fb");

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
          } catch (error) {
            console.error("Gagal mencetak nota:", error);
          }
        } else {
          response = await api.post("/add-Pembelian", params, {
            headers: {
              Authorization: `Bearer ${token}`, 
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
        }
        
        if (response.status === 200) {
          setsuplier_nama("");
          setpembelian_tgl(new Date().toISOString().slice(0, 10)); 
          setalamat("");
          setno_hp("");
          setSelectedSupplier(null);
          setInputFields([
            {
              pembayaran: "cash",
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
          toast.update(toastId, {
            render: "Data sent successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          window.location.reload();
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
      } finally {
        setIsSubmitting(false); // unlock
      }
    } else {
      setIsSubmitting(false);
    }
  };

  const navigate = useNavigate();
  const handleTab = (event) => {
    navigate(`/${event}`);
  };

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
    const options = { weekday: "long", year: "numeric", month: "short", day: "numeric" };
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

  const resTtlPembelian = inputFields.reduce(
    (sum, val) => sum + Number(val.pembelian_total || 0),
    0,
  );
  
  return (
    <div className="p-1 md:p-3 xl:p-5 font-poppins">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 w-full h-full mx-auto flex flex-col">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-100 pb-4">
          <button className="px-4 py-2 bg-teal-50 text-teal-700 font-bold rounded-lg text-sm border border-teal-200 transition-colors">
            Pembelian
          </button>
          <button
            className="px-4 py-2 text-gray-500 hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors"
            onClick={() => handleTab("tambah-pengiriman")}
          >
            Pengiriman
          </button>
          <button
            className="px-4 py-2 text-gray-500 hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors"
            onClick={() => handleTab("tambah-karyawan")}
          >
            Karyawan
          </button>
          {/* <button
            className="px-4 py-2 text-gray-500 hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors"
            onClick={() => handleTab("tambah-kardus")}
          >
            Kardus
          </button> */}
        </div>

        {/* Main Content Form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="h-fit">
            
            {/* Header Form (Supplier & Date) */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Select Supplier */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Supplier
                  </label>
                  <Select
                    value={selectedSupplier}
                    onChange={setSelectedSupplier}
                    options={supplierOptions}
                    onMenuOpen={fetchSuppliers}
                    placeholder="-- Pilih Supplier --"
                    isClearable
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      control: (base, state) => ({
                        ...base,
                        minHeight: '42px',
                        fontSize: '14px',
                        borderColor: state.isFocused ? '#2dd4bf' : '#e5e7eb',
                        boxShadow: state.isFocused ? '0 0 0 1px #2dd4bf' : 'none',
                        borderRadius: '0.5rem',
                        '&:hover': { borderColor: '#2dd4bf' }
                      }),
                    }}
                  />
                </div>

                {/* Tanggal Pembelian */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                    name="pembelian_tgl"
                    value={pembelian_tgl}
                    onChange={handlePembelian_tgl}
                    required
                  />
                </div>

                {/* Kondisional: Supplier Baru */}
                {selectedSupplier && selectedSupplier.value === 'new' && (
                  <>
                    <div className="w-full">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Nama Supplier Baru
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                        placeholder="Contoh: PT. Makmur"
                        name="suplier_nama"
                        value={suplier_nama}
                        onChange={handleSuplier_nama}
                        required
                      />
                    </div>

                    <div className="w-full">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Nomor HP
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                        placeholder="081234567890"
                        name="no_hp"
                        value={no_hp}
                        onChange={handleNo_hp}
                      />
                    </div>

                    <div className="w-full md:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Alamat Lengkap
                      </label>
                      <textarea
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                        placeholder="Masukkan alamat supplier..."
                        name="alamat"
                        rows="2"
                        value={alamat}
                        onChange={handleAlamat}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ========================================= */}
            {/* VIEW MOBILE: CARD LAYOUT (Tampil < 768px)  */}
            {/* ========================================= */}
            <div className="md:hidden space-y-4 mb-6">
              <label className="block text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">
                Daftar Barang ({inputFields.length} Item)
              </label>
              
              {inputFields.map((field, index) => {
                let rowNumber = index + 1;
                return (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative flex flex-col gap-3">
                    
                    {/* Header Card & Delete Button */}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="font-bold text-teal-700 text-sm">Item #{rowNumber}</span>
                      {index > 0 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveField(index)} 
                          className="w-7 h-7 flex justify-center items-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <i className="fa fa-trash text-xs"></i>
                        </button>
                      )}
                    </div>

                    {/* Tipe & Pilih Barang */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Tipe</label>
                          <select
                            className="w-full py-2 px-2 bg-white border border-gray-200 rounded-md text-xs text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none"
                            name="barang_tipe"
                            value={field.barang_tipe}
                            onChange={(event) => handleInputChange(index, event)}
                          >
                            <option value="beras">Beras</option>
                            <option value="gabah">Gabah</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Pilih Barang</label>
                          <Select
                            value={field.selectedBarang}
                            onMenuOpen={() => fetchBarangByType(field.barang_tipe)}
                            onChange={(selected) => {
                              const values = [...inputFields];
                              values[index].selectedBarang = selected;
                              values[index].barang_id = selected && selected.value !== 'new' ? selected.value : null;
                              setInputFields(values);
                            }}
                            options={barangOptionsCache[field.barang_tipe] ? [...barangOptionsCache[field.barang_tipe], { value: 'new', label: '+ Barang Baru' }] : [{ value: 'new', label: '+ Barang Baru' }]}
                            placeholder="Cari..."
                            isClearable
                            menuPortalTarget={document.body}
                            styles={{
                              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                              control: (base, state) => ({
                                ...base,
                                minHeight: '34px',
                                fontSize: '12px',
                                borderColor: state.isFocused ? '#2dd4bf' : '#e5e7eb',
                                borderRadius: '0.375rem',
                              })
                            }}
                          />
                        </div>
                      </div>

                      {/* Input Barang Baru */}
                      {field.selectedBarang && field.selectedBarang.value === 'new' && (
                        <div>
                          <input
                            name="barang_nama"
                            className="w-full py-2 px-3 bg-white border border-teal-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none"
                            placeholder="Ketik nama barang baru..."
                            value={field.barang_nama}
                            onChange={(event) => handleInputChange(index, event)}
                            required
                          />
                        </div>
                      )}
                    </div>

                    {/* Tonase: Kotor, Potongan, Bersih */}
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block text-center">Kotor</label>
                        <input
                          type="number"
                          min={1}
                          className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-center text-gray-700 outline-none focus:border-teal-400"
                          name="pembelian_kotor"
                          value={field.pembelian_kotor}
                          onChange={(event) => handleInputChangePembelianKotor(index, event)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-red-400 uppercase mb-1 block text-center">Potongan</label>
                        <input
                          type="number"
                          min={0}
                          className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-center text-red-600 font-medium outline-none focus:border-red-400"
                          name="pembelian_potongan"
                          value={field.pembelian_potongan}
                          onChange={(event) => handleInputChangePembelianPotongan(index, event)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-green-600 uppercase mb-1 block text-center">Bersih</label>
                        <input
                          className="w-full py-1.5 px-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-center text-green-700 font-bold outline-none"
                          name="pembelian_bersih"
                          value={field.pembelian_bersih}
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Harga & Subtotal */}
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Harga (Rp)</label>
                        <input
                          type="number"
                          className="w-full py-2 px-3 bg-white border border-gray-200 rounded-md text-sm text-teal-700 font-bold outline-none focus:border-teal-400"
                          name="pembelian_harga"
                          value={field.pembelian_harga}
                          onChange={(event) => handleInputChangeHarga(index, event)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Subtotal</label>
                        <input
                          type="text"
                          className="w-full py-2 px-3 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-800 font-bold text-right outline-none"
                          value={RupiahFormat(field.pembelian_total || 0)}
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Pembayaran & Nota */}
                    <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-1">
                      <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200 w-1/2">
                        <label className={`flex-1 flex items-center justify-center cursor-pointer py-1.5 rounded-md transition-all ${field.pembayaran === "cash" ? "bg-teal-600 text-white shadow-sm" : "text-gray-500"}`}>
                          <input
                            type="radio"
                            className="hidden"
                            name={`pembayaran-${index}`}
                            value="cash"
                            onChange={() => handleInputChange(index, { target: { name: 'pembayaran', value: 'cash' } })}
                            checked={field.pembayaran === "cash"}
                          />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Cash</span>
                        </label>
                        <label className={`flex-1 flex items-center justify-center cursor-pointer py-1.5 rounded-md transition-all ${field.pembayaran === "hutang" ? "bg-red-500 text-white shadow-sm" : "text-gray-500"}`}>
                          <input
                            type="radio"
                            className="hidden"
                            name={`pembayaran-${index}`}
                            value="hutang"
                            onChange={() => handleInputChange(index, { target: { name: 'pembayaran', value: 'hutang' } })}
                            checked={field.pembayaran === "hutang"}
                          />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Hutang</span>
                        </label>
                      </div>
                      
                      <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                          name="pembelian_nota_st"
                          value="yes"
                          onChange={(event) => handleInputCheckbox(index, event)}
                          checked={field.pembelian_nota_st === "yes"}
                        />
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Cetak Nota</span>
                      </label>
                    </div>

                  </div>
                );
              })}

              {/* Total Mobile Bawah */}
              <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-4 shadow-sm flex justify-between items-center">
                <span className="text-sm font-bold text-teal-900 uppercase">Grand Total</span>
                <span className="text-lg font-bold text-teal-700">{RupiahFormat(resTtlPembelian)}</span>
              </div>
            </div>

            {/* ========================================= */}
            {/* VIEW DESKTOP: TABLE LAYOUT (Tampil > 768px) */}
            {/* ========================================= */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-12">No</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-28">Tipe</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56">Pilih Barang</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-48">Nama Barang Baru</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-24">T. Kotor</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-24">Potongan</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-24">T. Bersih</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-36">Pembayaran</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200 w-32">Harga (Rp)</th>
                      <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200 w-32">Total</th>
                      <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-16">Nota</th>
                      <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center w-14">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">

                    {inputFields.map((field, index) => {
                     const rowNumber = index + 1;
                      return (
                        <tr key={index} className="hover:bg-teal-50/20 transition-colors">
                          <td className="py-2 px-2 text-center text-sm font-medium text-gray-500 border-r border-gray-100">{rowNumber}</td>
                          
                          <td className="py-2 px-3 border-r border-gray-100">
                            <select
                              className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all cursor-pointer"
                              name="barang_tipe"
                              value={field.barang_tipe}
                              onChange={(event) => handleInputChange(index, event)}
                            >
                              <option value="beras">Beras</option>
                              <option value="gabah">Gabah</option>
                            </select>
                          </td>
                          
                          <td className="py-2 px-3 border-r border-gray-100">
                            <Select
                              value={field.selectedBarang}
                              onMenuOpen={() => fetchBarangByType(field.barang_tipe)}
                              onChange={(selected) => {
                                const values = [...inputFields];
                                values[index].selectedBarang = selected;
                                values[index].barang_id = selected && selected.value !== 'new' ? selected.value : null;
                                setInputFields(values);
                              }}
                              options={barangOptionsCache[field.barang_tipe] ? [...barangOptionsCache[field.barang_tipe], { value: 'new', label: '+ Barang Baru' }] : [{ value: 'new', label: '+ Barang Baru' }]}
                              placeholder="Cari Barang..."
                              isClearable
                              menuPortalTarget={document.body}
                              styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                control: (base, state) => ({
                                  ...base,
                                  minHeight: '34px',
                                  fontSize: '13px',
                                  borderColor: state.isFocused ? '#2dd4bf' : '#e5e7eb',
                                  boxShadow: state.isFocused ? '0 0 0 1px #2dd4bf' : 'none',
                                  borderRadius: '0.375rem',
                                  '&:hover': { borderColor: '#2dd4bf' }
                                })
                              }}
                            />
                          </td>
                          
                          <td className="py-2 px-3 border-r border-gray-100">
                            {field.selectedBarang && field.selectedBarang.value === 'new' ? (
                              <input
                                name="barang_nama"
                                className="w-full py-1.5 px-3 bg-white border border-teal-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                                placeholder="Ketik nama baru..."
                                value={field.barang_nama}
                                onChange={(event) => handleInputChange(index, event)}
                                required
                              />
                            ) : (
                              <span className="text-xs text-gray-400 italic bg-gray-50 px-2 py-1.5 rounded w-full block border border-gray-100 text-center">Otomatis dari sistem</span>
                            )}
                          </td>
                          
                          <td className="py-2 px-3 border-r border-gray-100">
                            <input
                              type="number"
                              min={1}
                              className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-center text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                              name="pembelian_kotor"
                              value={field.pembelian_kotor}
                              onChange={(event) => handleInputChangePembelianKotor(index, event)}
                              required
                              onFocus={(e) => e.target.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                            />
                          </td>
                          
                          <td className="py-2 px-3 border-r border-gray-100">
                            <input
                              type="number"
                              min={0}
                              className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-center text-red-600 font-medium focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all"
                              name="pembelian_potongan"
                              value={field.pembelian_potongan}
                              onChange={(event) => handleInputChangePembelianPotongan(index, event)}
                              onFocus={(e) => e.target.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                            />
                          </td>
                          
                          <td className="py-2 px-3 border-r border-gray-100">
                            <input
                              className="w-full py-1.5 px-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-center text-green-700 font-bold cursor-not-allowed outline-none"
                              name="pembelian_bersih"
                              value={field.pembelian_bersih}
                              readOnly
                            />
                          </td>

                          <td className="py-2 px-3 border-r border-gray-100">
                            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                              <label className={`flex-1 flex flex-col items-center justify-center cursor-pointer py-1 px-2 rounded-md transition-all ${field.pembayaran === "cash" ? "bg-teal-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}>
                                <input
                                  type="radio"
                                  className="hidden"
                                  name={`pembayaran-${index}`}
                                  value="cash"
                                  onChange={() => handleInputChange(index, { target: { name: 'pembayaran', value: 'cash' } })}
                                  checked={field.pembayaran === "cash"}
                                />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Cash</span>
                              </label>
                              <label className={`flex-1 flex flex-col items-center justify-center cursor-pointer py-1 px-2 rounded-md transition-all ${field.pembayaran === "hutang" ? "bg-red-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}>
                                <input
                                  type="radio"
                                  className="hidden"
                                  name={`pembayaran-${index}`}
                                  value="hutang"
                                  onChange={() => handleInputChange(index, { target: { name: 'pembayaran', value: 'hutang' } })}
                                  checked={field.pembayaran === "hutang"}
                                />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Hutang</span>
                              </label>
                            </div>
                          </td>

                          <td className="py-2 px-3 border-r border-gray-100">
                            <input
                              type="number"
                              className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-right text-teal-700 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                              name="pembelian_harga"
                              value={field.pembelian_harga}
                              onChange={(event) => handleInputChangeHarga(index, event)}
                              required
                              onFocus={(e) => e.target.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                            />
                          </td>

                          <td className="py-2 px-3 border-r border-gray-100">
                            <input
                              type="text"
                              className="w-full py-1.5 px-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-right text-gray-800 font-bold cursor-not-allowed outline-none"
                              value={RupiahFormat(field.pembelian_total || 0)}
                              readOnly
                            />
                          </td>

                          <td className="py-2 px-2 text-center border-r border-gray-100">
                            <input
                              type="checkbox"
                              className="w-5 h-5 text-teal-600 bg-white border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                              name="pembelian_nota_st"
                              value="yes"
                              onChange={(event) => handleInputCheckbox(index, event)}
                              checked={field.pembelian_nota_st === "yes"}
                            />
                          </td>

                          <td className="py-2 px-2 text-center">
                            {index === 0 ? (
                              <button type="button" className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed" disabled>
                                <i className="fa fa-trash"></i>
                              </button>
                            ) : (
                              <button type="button" onClick={() => handleRemoveField(index)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors">
                                <i className="fa fa-trash"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    <tr className="bg-gray-100/80 border-t-2 border-gray-300">
                      <td colSpan="9" className="text-right py-3 px-4 text-sm font-bold text-gray-700 tracking-wider border-r border-gray-300">
                        GRAND TOTAL KESELURUHAN
                      </td>
                      <td className="text-right py-3 px-3 text-sm font-bold text-red-600 border-r border-gray-200 bg-red-50/50">
                        {RupiahFormat(resTtlPembelian)}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Tombol Tambah & Submit */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
              <button
                type="button"
                onClick={handleAddField}
                className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors shadow-sm w-full md:w-auto justify-center"
              >
                <i className="fa fa-plus text-xs"></i> Tambah Baris Barang
              </button>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  type="submit"
                  value="simcetak"
                  name="type_submit"
                  className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <i className="fa fa-print"></i> Simpan & Cetak
                </button>
                <button
                  type="submit"
                  value="simpan"
                  name="type_submit"
                  className="flex-1 md:flex-none px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <i className="fa fa-save"></i> Simpan
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default TambahPembelian;