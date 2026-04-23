import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import RupiahFormat from "../utilities/RupiahFormat";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import api from "../utilities/axiosInterceptor";

function TambahPengiriman() {
  // TOKEN
  const token = localStorage.getItem("token");
  //
  const [pengiriman_tgl, setPengiriman_tgl] = useState(new Date().toISOString().slice(0, 10));
  const [nama_pembeli, setNama_pembeli] = useState("");
  const [uang_muka, setUang_muka] = useState("");
  const [status, setStatus] = useState("yes");
  const [boxHarga, setBoxHarga] = useState(null);
  const [boxJumlah, setBoxJumlah] = useState(0);
  const [barangOptionsCache, setBarangOptionsCache] = useState({});
  const [supplierOptionsCache, setSupplierOptionsCache] = useState([]);
  const [stockDataByIndex, setStockDataByIndex] = useState({});
  const handlePengiriman_tgl = (event) => {
    setPengiriman_tgl(event.target.value);
  };

  const handleNama_pembeli = (event) => {
    setNama_pembeli(event.target.value);
  };

  const handleUang_muka = (event) => {
    setUang_muka(event.target.value);
  };

  const handleStatus = (event) => {
    setStatus(event.target.value);
  };

  const [inputFields, setInputFields] = useState([
    {
      barang_tipe: "beras",
      barang_id: null,
      selectedBarang: null,
      supplier_id: null,
      selectedSupplier: null,
      current_stock: 0,
      data_tonase: "",
      data_harga: "",
      data_total: "",
      pembayaran_st: "cash",
    },
  ]);

  useEffect(() => {
    const fectData = async () => {
      try {
        //fetching
        const response = await api.get("/detail-Kardus/1", {
          headers: {
            Authorization: `Bearer ${token}`, // Sisipkan token di header
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        //get response data
        const harga = await response.data.data?.harga;
        const jumlah = await response.data.data?.jumlah;
        console.log('hihi', response.data.data);
        // console.log(harga);
        //
        if (response.status === 200) {
          setInputFields((prevFields) =>
            prevFields.map((field) => ({
              ...field,
              data_harga: field.data_harga || harga,
            })),
          );
        }
        //assign response data to state "posts"
        setBoxHarga(harga);
        setBoxJumlah(jumlah);
      } catch (error) {
        console.error("Error fetching kardus data:", error);
      }
    };
    fectData();
  }, [token]);
  //

  const fetchBarangByType = useCallback(
    async (tipe) => {
      if (barangOptionsCache[tipe]) {
        return;
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

  const fetchSuppliers = useCallback(async () => {
    if (supplierOptionsCache.length > 0) {
      return;
    }
    try {
      const response = await api.get('/get-suplier', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200 && Array.isArray(response.data.dataSuplier)) {
        const options = response.data.dataSuplier.map((item) => ({
          value: item.id,
          label: item.nama,
        }));
        setSupplierOptionsCache(options);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  }, [supplierOptionsCache, token]);

  const fetchStock = useCallback(
    async (barangId) => {
      try {
        const response = await api.get('/get-stock', {
          params: { barang_id: barangId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200 && Array.isArray(response.data.dataStock)) {
          return response.data.dataStock;
        }
        return [];
      } catch (error) {
        console.error(`Failed to fetch stock for barang ${barangId}:`, error);
        return [];
      }
    },
    [token],
  );

  useEffect(() => {
    fetchBarangByType('beras');
    fetchBarangByType('gabah');
    fetchSuppliers();
  }, [fetchBarangByType, fetchSuppliers]);

  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      {
        barang_tipe: "beras",
        barang_id: null,
        selectedBarang: null,
        supplier_id: null,
        selectedSupplier: null,
        current_stock: 0,
        data_tonase: "",
        data_harga: boxHarga || "",
        data_total: "",
        pembayaran_st: "cash",
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

    if (event.target.name === "barang_tipe") {
      values[index].barang_tipe = event.target.value;
      values[index].selectedBarang = null;
      values[index].barang_id = null;
      fetchBarangByType(event.target.value);
    } else if (event.target.name === "pembayaran_st") {
      values[index].pembayaran_st = event.target.value;
    } else {
      values[index][event.target.name] = event.target.value;
    }

    if (event.target.name === "data_tonase" || event.target.name === "data_harga") {
      const tonase = Number(values[index].data_tonase || 0);
      const harga = Number(values[index].data_harga || 0);
      values[index].data_total = tonase * harga;
    }

    setInputFields(values);
  };

  const handleSelectBarang = (index, selected) => {
    const values = [...inputFields];
    values[index].selectedBarang = selected;
    values[index].barang_id = selected ? selected.value : null;
    values[index].current_stock = 0;
    values[index].selectedSupplier = null;
    values[index].supplier_id = null;
    setInputFields(values);

    // Fetch stock when barang is selected
    if (selected && selected.value) {
      fetchStock(selected.value).then((stockData) => {
        // Extract suppliers from stock data
        console.log('Stock data for barang_id', selected.value, stockData);
        const supplierOptions = stockData.map((item) => ({
          value: item.suplier_id,
          label: item.suplier.suplier_nama + " (Stok: " + item.stok + ")",
        }));

        // Store stock data and supplier options for this row
        setStockDataByIndex((prev) => ({
          ...prev,
          [index]: { stockData, supplierOptions },
        }));
      });
    }
  };

  const handleSelectSupplier = (index, selected) => {
    const values = [...inputFields];
    values[index].selectedSupplier = selected;
    values[index].supplier_id = selected ? selected.value : null;

    // Look up stock for the selected supplier
    if (selected && stockDataByIndex[index]) {
      const stockEntry = stockDataByIndex[index].stockData.find(
        (item) => item.suplier_id === selected.value
      );
      if (stockEntry) {
        values[index].current_stock = stockEntry.stok;
      }
    }

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
      const data = {
        pengiriman_tgl: pengiriman_tgl,
        nama_pembeli: nama_pembeli || null,
        uang_muka: uang_muka || null,
        status: status || null,
      };
      const sanitizedFields = inputFields.map((item) => ({
        barang_id: item.barang_id || null,
        data_tonase: item.data_tonase,
        data_harga: item.data_harga,
        data_total: item.data_total,
        pembayaran_st: item.pembayaran_st || null,
        supplier_id: item.supplier_id || null,
      }));
      let params = {
        formData: sanitizedFields,
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
        setNama_pembeli("");
        setUang_muka("");
        setStatus("yes");
        setInputFields([
          {
            barang_tipe: "beras",
            barang_id: null,
            selectedBarang: null,
            supplier_id: null,
            selectedSupplier: null,
            current_stock: 0,
            data_tonase: "",
            data_harga: boxHarga || "",
            data_total: "",
            pembayaran_st: "cash",
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

  const resTtlPengiriman = inputFields.reduce(
    (sum, val) => sum + Number(val.data_total || 0),
    0,
  );

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
            {/* Baris Pertama: Pengiriman & Uang Muka */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-4">

              {/* Input Tanggal Pengiriman */}
              <div className="flex flex-col md:flex-row md:items-center font-poppins">
                <label className="text-sm xl:text-base font-medium text-gray-700 w-32">
                  Pengiriman
                </label>
                <div className="flex-1 md:ml-4">
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-colorBlue focus:border-transparent transition-all"
                    name="pengiriman_tgl"
                    value={pengiriman_tgl}
                    onChange={handlePengiriman_tgl}
                    required
                  />
                </div>
              </div>

              {/* Input Uang Muka */}
              <div className="flex flex-col md:flex-row md:items-center font-poppins">
                <label className="text-sm xl:text-base font-medium text-gray-700 w-32">
                  Uang Muka
                </label>
                <div className="flex-1 md:ml-4">
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-colorBlue focus:border-transparent transition-all"
                    placeholder="0"
                    name="uang_muka"
                    value={uang_muka}
                    onChange={handleUang_muka}
                  />
                </div>
              </div>
            </div>

            {/* Baris Kedua: Nama Pembeli & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">

              {/* Input Nama Pembeli */}
              <div className="flex flex-col md:flex-row md:items-center font-poppins">
                <label className="text-sm xl:text-base font-medium text-gray-700 w-32">
                  Nama Pembeli
                </label>
                <div className="flex-1 md:ml-4">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-colorBlue focus:border-transparent transition-all"
                    placeholder="Masukkan nama pembeli"
                    name="nama_pembeli"
                    value={nama_pembeli}
                    onChange={handleNama_pembeli}
                  />
                </div>
              </div>

              {/* Input Status */}
              <div className="flex flex-col md:flex-row md:items-center font-poppins">
                <label className="text-sm xl:text-base font-medium text-gray-700 w-32">
                  Status
                </label>
                <div className="flex-1 md:ml-4">
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-colorBlue focus:border-transparent transition-all cursor-pointer"
                    name="status"
                    value={status}
                    onChange={handleStatus}
                  >
                    <option value="yes">Yes (Publish)</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-[110%] xl:w-full font-poppins text-xs xl:text-md">
                <thead>
                  <tr className="w-full text-white text-center font-poppins text-xs xl:text-md bg-colorBlue">
                    <th className="border border-black md:w-[5%]">No</th>
                    <th className="border border-black md:w-[10%]">Tipe</th>
                    <th className="border border-black md:w-[12%]">Barang</th>
                    <th className="border border-black md:w-[12%]">Supplier</th>
                    <th className="border border-black md:w-[8%]">Stock</th>
                    <th className="border border-black md:w-[8%]">Tonase</th>
                    <th className="border border-black md:w-[8%]">Harga</th>
                    <th className="border border-black md:w-[8%]">Total</th>
                    <th className="border border-black md:w-[10%]">Pembayaran</th>
                    <th className="border border-black md:w-[5%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {inputFields &&
                    inputFields.map((field, index) => {
                      const rowNumber = index + 1;
                      return (
                        <tr
                          key={index}
                          className={`text-center hover:bg-colorBlue  ${rowNumber % 2 === 0 ? "bg-gray-50" : "bg-gray-200"
                            }`}
                        >
                          <td className="border border-black">{rowNumber}</td>
                          <td className="border border-black">
                            <select
                              className="border m-2 w-24 md:w-3/4 p-1"
                              name="barang_tipe"
                              value={field.barang_tipe}
                              onChange={(event) => handleInputChange(index, event)}
                            >
                              <option value="beras">Beras</option>
                              <option value="katul">Katul</option>
                              <option value="sekam">Sekam</option>
                            </select>
                          </td>
                          <td className="border border-black">
                            <div className="p-1">
                              <Select
                                value={field.selectedBarang}
                                onChange={(selected) => handleSelectBarang(index, selected)}
                                options={barangOptionsCache[field.barang_tipe] || []}
                                placeholder="Pilih Barang"
                                isClearable
                                menuPortalTarget={document.body}
                                styles={{
                                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                  control: (base) => ({
                                    ...base,
                                    minHeight: '30px',
                                    fontSize: '12px',
                                  }),
                                }}
                              />
                            </div>
                          </td>
                          <td className="border border-black">
                            <div className="p-1">
                              <Select
                                value={field.selectedSupplier}
                                onChange={(selected) => handleSelectSupplier(index, selected)}
                                options={stockDataByIndex[index]?.supplierOptions || []}
                                placeholder="Pilih Supplier"
                                isClearable
                                menuPortalTarget={document.body}
                                styles={{
                                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                  control: (base) => ({
                                    ...base,
                                    minHeight: '30px',
                                    fontSize: '12px',
                                  }),
                                }}
                              />
                            </div>
                          </td>
                          <td className="border border-black bg-slate-300">
                            <input
                              type="text"
                              className="border m-2 w-24 md:w-3/4 p-1 bg-slate-300"
                              name="current_stock"
                              value={field.current_stock}
                              readOnly
                              required
                            ></input>
                          </td>
                          <td className="border border-black">
                            <input
                              type="number"
                              required
                              name="data_tonase"
                              className="border m-2 w-24 md:w-3/4 p-1"
                              value={field.data_tonase}
                              onChange={(event) => handleInputChange(index, event)}
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
                          <td className="border border-black">
                            <input
                              type="number"
                              required
                              name="data_harga"
                              className="border m-2 w-24 md:w-3/4 p-1"
                              value={field.data_harga}
                              onChange={(event) => handleInputChange(index, event)}
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
                          <td className="border border-black bg-slate-300">
                            <input
                              type="text"
                              className="border m-2 w-24 md:w-3/4 p-1 bg-slate-300"
                              name="data_total"
                              value={RupiahFormat(field.data_total || 0)}
                              readOnly
                              required
                            ></input>
                          </td>
                          <td className="border border-black">
                            <select
                              className="border m-2 w-24 md:w-3/4 p-1"
                              name="pembayaran_st"
                              value={field.pembayaran_st}
                              onChange={(event) => handleInputChange(index, event)}
                            >
                              <option value="cash">Cash</option>
                              <option value="hutang">Hutang</option>
                            </select>
                          </td>
                          <td className="border border-black">
                            {rowNumber === 1 ? (
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
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  {/* Footer Grand Total */}
                  <tr className="bg-gray-100">
                    <td className="border border-black text-right py-2 px-4 font-bold" colSpan="7">
                      GRAND TOTAL
                    </td>
                    <td className="border border-black p-1">
                      <input
                        type="text"
                        className="w-full p-1 bg-white border border-red-500 text-red-600 font-bold text-right"
                        value={RupiahFormat(resTtlPengiriman)}
                        readOnly
                      />
                    </td>
                    <td className="border border-black" colSpan="2"></td>
                  </tr>
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
