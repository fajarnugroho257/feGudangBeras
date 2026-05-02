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
  
  const handleInputChange = (event) => {
    const name = event.target.name;
    const val = event.target.value;
    if (name === "dateFrom") setDateFrom(val);
    if (name === "dateTo") setDateTo(val);
  };

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

  const [dateFrom, setDateFrom] = useState(getFirstDateOfMonth());
  const [dateTo, setDateTo] = useState(getLastDateOfMonth());
  const [blur, setBlur] = useState(true);
  const [datas, setDatas] = useState([]);
  const [modalBayar, setModalBayar] = useState(false);
  const [isFunctionComplete, setIsFunctionComplete] = useState(false);
  const [notaId, setNotaId] = useState([]);

  const endPoint = "/index-draft-nota";

  useEffect(() => {
    let params = { dateFrom, dateTo };
    setBlur(true);
    const fectData = async () => {
      try {
        const response = await api.post(endPoint, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        const data = await response.data?.dataNota;
        if (response.status === 200) setBlur(false);
        setDatas(data);
      } catch (error) {
        console.error("Error fetching nota data:", error);
        setBlur(false);
      }
    };
    fectData();
    setIsFunctionComplete(false);
  }, [dateFrom, dateTo, modalBayar, isFunctionComplete, token]);

  const handleDetailBayar = (id) => {
    setNotaId(id);
    setModalBayar(!modalBayar);
  };

  const handleClose = () => setModalBayar(!modalBayar);

  const handleDelete = async (nota_id) => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus data ini?");
    if (isConfirmed) {
      const toastId = toast.loading("Sending data...");
      try {
        const params = { nota_id: nota_id };
        const response = await api.post("/delete-nota", params, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        if (response.status === 200) {
          toast.update(toastId, { render: "Delete data successfully!", type: "success", isLoading: false, autoClose: 3000 });
        } else {
          toast.update(toastId, { render: "Error delete data!", type: "error", isLoading: false, autoClose: 5000 });
        }
      } catch (error) {
        toast.update(toastId, { render: "Error delete data!", type: "error", isLoading: false, autoClose: 5000 });
      }
      setIsFunctionComplete(true);
    }
  };

  let rowCounter = 0; // Digunakan untuk penomoran baris

  return (
    <>
      <div className="p-1 md:p-3 xl:p-5 font-poppins">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 w-full mx-auto">
          
          {/* Header Title */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Nota Pembelian</h2>
              <p className="text-sm text-gray-500 mt-1">Kelola draf nota dan riwayat pembayaran supplier</p>
            </div>
          </div>

          {/* Filters Panel */}
          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-wrap items-end gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Dari</label>
              <input
                name="dateFrom"
                type="date"
                className="w-full sm:w-40 border border-gray-200 py-2 px-3 rounded-lg bg-white text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all text-gray-700"
                value={dateFrom}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Sampai</label>
              <input
                name="dateTo"
                type="date"
                className="w-full sm:w-40 border border-gray-200 py-2 px-3 rounded-lg bg-white text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all text-gray-700"
                value={dateTo}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Table Container */}
          <div className={`overflow-x-auto rounded-xl border border-gray-200 transition-opacity duration-300 ${blur ? "opacity-50" : "opacity-100"}`}>
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="py-3.5 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-12">No</th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">ID Nota</th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 text-center">Waktu Dibuat</th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Nama Supplier</th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 text-center">Tgl Beli</th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 text-right">Total Pembelian</th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 text-center w-24">Status</th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {datas.map((item) => {
                  const first_nota_data = item.nota_data[0];
                  const notaDataExceptFirst = item.nota_data.slice(1);
                  const length = item.nota_data.length;
                  const pembelian_pertama = first_nota_data.pembelian.pembelian_data;
                  let jlh_pembelian_pertama = 0;
                  rowCounter++;
                  // console.log(first_nota_data)

                  return (
                    <React.Fragment key={item.id}>
                      {/* Baris Utama Grouping */}
                      <tr className="hover:bg-teal-50/10 transition-colors border-t-2 border-gray-100">
                        <td className="py-4 px-4 text-center text-sm font-medium text-gray-600 border-r border-gray-100" rowSpan={length}>
                          {rowCounter}
                        </td>
                        <td className="py-4 px-4 text-sm font-bold text-teal-700 border-r border-gray-100" rowSpan={length}>
                          #ORD{first_nota_data.nota_id}
                        </td>
                        <td className="py-4 px-4 text-center border-r border-gray-100" rowSpan={length}>
                          <p className="text-sm text-gray-700 font-medium">{FormatTanggal(item.tanggal)}</p>
                          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter mt-0.5">Jam {item.waktu}</p>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-800 font-semibold uppercase border-r border-gray-100">
                          {first_nota_data.pembelian.suplier.suplier_nama}
                        </td>
                        <td className="py-4 px-4 text-center text-sm text-gray-600 border-r border-gray-100">
                          {FormatTanggal(first_nota_data.pembelian.pembelian_tgl)}
                        </td>
                        <td className="py-4 px-4 text-right text-sm font-bold text-gray-800 border-r border-gray-100">
                          {pembelian_pertama.forEach((pem_per) => { jlh_pembelian_pertama += parseInt(pem_per.pembelian_total); })}
                          {RupiahFormat(jlh_pembelian_pertama)}
                        </td>
                        <td className="py-4 px-4 text-center border-r border-gray-100" rowSpan={length}>
                          {item.nota_st === "yes" ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase tracking-wider">
                              Lunas
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider">
                              Hutang
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center" rowSpan={length}>
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => handleDetailBayar(item.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              title="Bayar / Nitip"
                            >
                              <i className="fa fa-edit text-sm"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Hapus"
                            >
                              <i className="fa fa-trash text-sm"></i>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Baris Sisa di dalam Grouping Nota */}
                      {notaDataExceptFirst.map((value, index) => {
                        const pembelian = value.pembelian.pembelian_data;
                        let jlh_pembelian_sub = 0;
                        return (
                          <tr key={index} className="hover:bg-teal-50/10 transition-colors">
                            <td className="py-3 px-4 text-sm text-gray-700 font-semibold uppercase border-r border-gray-100">
                              {value.pembelian.suplier.suplier_nama}
                            </td>
                            <td className="py-3 px-4 text-center text-sm text-gray-600 border-r border-gray-100">
                              {FormatTanggal(value.pembelian.pembelian_tgl)}
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-bold text-gray-800 border-r border-gray-100">
                              {pembelian.forEach((pem) => { jlh_pembelian_sub += parseInt(pem.pembelian_total); })}
                              {RupiahFormat(jlh_pembelian_sub)}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <ToastContainer position="bottom-right" />
      </div>
      
      {modalBayar && (
        <ModalNota isOpen={modalBayar} nota_id={notaId} isClose={handleClose} />
      )}
    </>
  );
}

export default Nota;