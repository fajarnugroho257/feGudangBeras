import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import RupiahFormat from "../utilities/RupiahFormat";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utilities/axiosInterceptor";

function ModalEditPengiriman({ pengiriman_id, isOpen, onClose }) {
  const token = localStorage.getItem("token");

  const [pengiriman_tgl, setPengiriman_tgl] = useState("");
  const [nama_pembeli, setNama_pembeli] = useState("");
  const [uang_muka, setUang_muka] = useState("");
  const [status, setStatus] = useState("yes");

  const [inputFieldsPengiriman, setInputFieldsPengiriman] = useState([]);
  const [barangOptionsCache, setBarangOptionsCache] = useState({});
  const [supplierOptionsCache, setSupplierOptionsCache] = useState([]);
  const [stockDataByIndex, setStockDataByIndex] = useState({});

  const handlePengiriman_tgl = (event) => setPengiriman_tgl(event.target.value);
  const handleNama_pembeli = (event) => setNama_pembeli(event.target.value);
  const handleUang_muka = (event) => setUang_muka(event.target.value);
  const handleStatus = (event) => setStatus(event.target.value);

  const fetchBarangByType = useCallback(async (tipe) => {
    if (barangOptionsCache[tipe]) return barangOptionsCache[tipe];
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
        setBarangOptionsCache((prev) => ({ ...prev, [tipe]: options }));
        return options;
      }
    } catch (error) {
      console.error(`Failed to fetch barang for type ${tipe}:`, error);
    }
    return [];
  }, [barangOptionsCache, token]);

  const fetchSuppliers = useCallback(async () => {
    if (supplierOptionsCache.length > 0) return;
    try {
      const response = await api.get('/get-suplier', {
        headers: { Authorization: `Bearer ${token}` },
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

  const fetchStock = useCallback(async (barangId) => {
    try {
      const response = await api.get('/get-stock', {
        params: { barang_id: barangId },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200 && Array.isArray(response.data.dataStock)) {
        return response.data.dataStock;
      }
      return [];
    } catch (error) {
      console.error(`Failed to fetch stock for barang ${barangId}:`, error);
      return [];
    }
  }, [token]);

  useEffect(() => {
    fetchBarangByType('beras');
    fetchBarangByType('katul');
    fetchBarangByType('sekam');
    fetchSuppliers();
  }, [fetchBarangByType, fetchSuppliers]);

  useEffect(() => {
    if (!isOpen || !pengiriman_id) return;
    const toastId = toast.loading("Getting data...");
    const fetchData = async () => {
      try {
        const response = await api.get(`/detail-Pengiriman/${pengiriman_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const resData = response.data.data;
          
          const formattedDate = resData.pengiriman_tgl
            ? resData.pengiriman_tgl.split("T")[0]
            : "";
          
          setPengiriman_tgl(formattedDate);
          setNama_pembeli(resData.nama_pembeli || "");
          setUang_muka(resData.uang_muka || "");
          setStatus(resData.status || "yes");

          const listPengiriman = resData.listPengiriman || [];
          
          const processedData = await Promise.all(listPengiriman.map(async (item, index) => {
            const barang_tipe = item.barang?.tipe || "beras"; 
            const fetchedBarangOptions = await fetchBarangByType(barang_tipe);
            
            let barangName = item.barang?.nama || `Barang ID ${item.barang_id}`;
            if (fetchedBarangOptions && item.barang_id) {
              const matchedBarang = fetchedBarangOptions.find(b => b.value === item.barang_id);
              if (matchedBarang) {
                barangName = matchedBarang.label;
              }
            }

            // Load stock for this barang
            let current_stock = 0;
            let supplierOptions = [];
            let suplierName = `Supplier ${item.supplier_id}`;
            if (item.barang_id) {
               const stockData = await fetchStock(item.barang_id);
               supplierOptions = stockData.map((stk) => ({
                 value: stk.suplier_id,
                 label: stk.suplier?.suplier_nama + " (Stok: " + stk.stok + ")",
               }));
               
               setStockDataByIndex((prev) => ({
                 ...prev,
                 [index]: { stockData, supplierOptions },
               }));
               
               const stockEntry = stockData.find(stk => stk.suplier_id === item.supplier_id);
               if (stockEntry) {
                 current_stock = stockEntry.stok;
                 suplierName = stockEntry.suplier?.suplier_nama;
               }
            }

            const selectedBarang = item.barang_id ? { value: item.barang_id, label: barangName } : null;
            const selectedSupplier = item.supplier_id ? { value: item.supplier_id, label: suplierName } : null;

            return {
              id: item.id,
              barang_tipe: barang_tipe,
              barang_id: item.barang_id,
              selectedBarang,
              supplier_id: item.supplier_id,
              selectedSupplier,
              current_stock,
              data_tonase: item.data_tonase || "",
              data_harga: item.data_harga || "",
              data_total: item.data_total || "",
              pembayaran_st: item.pembayaran_st || "cash",
            };
          }));

          setInputFieldsPengiriman(processedData);

          toast.update(toastId, {
            render: "Data getting successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
        } else {
          toast.update(toastId, {
            render: "Error getting data!" + response.status,
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
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pengiriman_id, isOpen, token]);

  const handleAddField = () => {
    setInputFieldsPengiriman([
      ...inputFieldsPengiriman,
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
  };

  const handleRemoveField = (index) => {
    const values = [...inputFieldsPengiriman];
    values.splice(index, 1);
    setInputFieldsPengiriman(values);
  };

  const handleInputChange = (index, event) => {
    const values = [...inputFieldsPengiriman];

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

    setInputFieldsPengiriman(values);
  };

  const handleSelectBarang = (index, selected) => {
    const values = [...inputFieldsPengiriman];
    values[index].selectedBarang = selected;
    values[index].barang_id = selected ? selected.value : null;
    values[index].current_stock = 0;
    values[index].selectedSupplier = null;
    values[index].supplier_id = null;
    setInputFieldsPengiriman(values);

    if (selected && selected.value) {
      fetchStock(selected.value).then((stockData) => {
        const supplierOptions = stockData.map((item) => ({
          value: item.suplier_id,
          label: item.suplier?.suplier_nama + " (Stok: " + item.stok + ")",
        }));
        setStockDataByIndex((prev) => ({
          ...prev,
          [index]: { stockData, supplierOptions },
        }));
      });
    }
  };

  const handleSelectSupplier = (index, selected) => {
    const values = [...inputFieldsPengiriman];
    values[index].selectedSupplier = selected;
    values[index].supplier_id = selected ? selected.value : null;

    if (selected && stockDataByIndex[index]) {
      const stockEntry = stockDataByIndex[index].stockData.find(
        (item) => item.suplier_id === selected.value
      );
      if (stockEntry) {
        values[index].current_stock = stockEntry.stok;
      }
    }
    setInputFieldsPengiriman(values);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const toastId = toast.loading("Sending data...");
    try {
      const pengirimanData = {
        id: pengiriman_id,
        pengiriman_tgl: pengiriman_tgl,
        nama_pembeli: nama_pembeli || null,
        uang_muka: uang_muka || null,
        status: status || null,
      };
      const sanitizedFields = inputFieldsPengiriman.map((item) => ({
        id: item.id,
        barang_id: item.barang_id || null,
        data_tonase: item.data_tonase,
        data_harga: item.data_harga,
        data_total: item.data_total,
        pembayaran_st: item.pembayaran_st || null,
        supplier_id: item.supplier_id || null,
      }));
      
      let params = {
        pengiriman_id: pengiriman_id,
        formData: sanitizedFields,
        pengirimanData: pengirimanData,
      };

      const response = await api.post("/edit-Pengiriman", params, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      
      if (response.status === 200) {
        toast.update(toastId, {
          render: "Data sent successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        onClose();
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
  };

  if (!isOpen) return null;

  const resTtlPengiriman = inputFieldsPengiriman.reduce(
    (sum, val) => sum + Number(val.data_total || 0),
    0,
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="bg-white w-[90%] h-[95%] p-6 rounded-lg shadow-lg relative z-10 flex flex-col">
        <div className="w-full h-fit flex-shrink-0">
          <h2 className="text-md xl:text-xl font-semibold mb-1 xl:mb-2 text-colorBlue font-poppins">
            Ubah Pengiriman
          </h2>
          <div className="h-[1px] xl:h-[2px] w-full bg-colorBlue mb-1 xl:mb-3"></div>
        </div>
        
        <div className="flex-grow overflow-auto">
          <form onSubmit={handleSubmit} className="h-fit">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">
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
                  {inputFieldsPengiriman.map((field, index) => {
                    const rowNumber = index + 1;
                    return (
                      <tr
                        key={index}
                        className={`text-center hover:bg-colorBlue ${
                          rowNumber % 2 === 0 ? "bg-gray-50" : "bg-gray-200"
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

            <div className="w-full text-right mt-3 flex justify-end gap-2">
              <button
                className="py-1 px-4 text-xs xl:text-md bg-green-700 font-poppins text-colorGray rounded hover:bg-green-900"
                type="submit"
              >
                <i className="fa fa-save"></i> Simpan
              </button>
            </div>
          </form>
        </div>

        <div className="w-full flex justify-between items-center mt-4 flex-shrink-0">
          <button
            className="bg-colorBlue text-colorGray py-1 px-4 rounded font-poppins text-xs xl:text-md"
            type="button"
            onClick={() => handleAddField()}
          >
            <i className="fa fa-plus"></i> Tambah Item
          </button>
          <button
            className="px-4 py-1 bg-colorGray border-2 border-colorBlue font-poppins text-colorBlue rounded hover:bg-slate-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalEditPengiriman;
