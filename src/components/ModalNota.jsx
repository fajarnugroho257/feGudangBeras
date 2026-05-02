import React, { useState, useEffect } from "react";
import axios from "axios";
import RupiahFormat from "../utilities/RupiahFormat";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utilities/axiosInterceptor";
import FormatTanggal from "../utilities/FormatTanggal";

function ModalNota({ isOpen, nota_id, isClose }) {
  // TOKEN
  const token = localStorage.getItem("token");
  
  const [blur, setBlur] = useState(true);
  let [grandTtlPembelian, setGrandTtlPembelian] = useState("0");
  const [bayarValue, setBayarValue] = useState("");
  const [bayarEditValue, setBayarEditValue] = useState("");
  const [dataBayar, setDataBayar] = useState([]);
  const [bayarId, setBayarId] = useState();
  const [stEdit, setstEdit] = useState(true);
  const [notaSt, setNotaSt] = useState("no");
  const [datasPembelian, setPembelian] = useState([]);
  const [saveBayar, setSaveBayar] = useState(false);

  const handleInputChange = (event) => {
    const name = event.target.name;
    const val = event.target.value;
    if (name === "bayar_value") setBayarValue(val);
    if (name === "edit_bayar_value") setBayarEditValue(val);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(date);
  };

  const fectData = async () => {
    const toastId = toast.loading("Getting data...");
    try {
      const response = await api.get(`/detail-draft-nota/${nota_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        toast.update(toastId, {
          render: "Data diperbaharui!",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        setGrandTtlPembelian(response.data.ttl_pembelian.pembelian_total);
        setDataBayar(response.data.data.nota_bayar);
        setNotaSt(response.data.data.nota_st);
        setPembelian(response.data.pembelian.nota_data);
        setBlur(false);
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Error getting data!",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    if (isOpen) fectData();
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!bayarValue) return alert("Nilai harus diisi");
    try {
      let params = { bayarValue, notaId: nota_id };
      const response = await api.post("/add-bayar-nota", params, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        fectData();
        setBayarValue("");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Terjadi kesalahan");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const response = await api.post("/delete-bayar-nota", { id }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) fectData();
      } catch (error) {
        alert(error.response?.data?.message);
      }
    }
  };

  const handleEdit = async (id) => {
    setBayarId(id);
    try {
      const response = await api.post("/show-bayar-nota", { id }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setBayarEditValue(response.data.data.bayar_value);
        setstEdit(false);
      }
    } catch (error) {
      alert(error.response?.data?.message);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    try {
      let params = { bayarValue: bayarEditValue, notaId: nota_id, id: bayarId };
      const response = await api.post("/edit-proses-bayar-nota", params, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        fectData();
        setstEdit(true);
      }
    } catch (error) {
      alert(error.response?.data?.message);
    }
  };

  const handleLunas = async (nota_st) => {
    if (window.confirm("Apakah Anda yakin akan merubah status pelunasan?")) {
      try {
        const response = await api.post("/update-bayar-nota", { id: nota_id, nota_st }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) isClose();
      } catch (error) {
        alert(error.response?.data?.message);
      }
    }
  };

  const downloadImage = async () => {
    const toastId = toast.loading("Preparing image...");
    try {
      const response = await api.get(`/nota-cetak-image/${nota_id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Nota_${nota_id}.png`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.update(toastId, { render: "Success!", type: "success", isLoading: false, autoClose: 2000 });
    } catch (error) {
      toast.dismiss();
    }
  };

  if (!isOpen) return null;

  let no = 0;
  let totalBeliFix = 0;
  let runningSisaHutang = grandTtlPembelian;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 font-poppins">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={isClose}></div>
      
      <div className="bg-white w-full max-w-7xl h-full max-h-[95vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
              <i className="fa fa-file-invoice-dollar text-lg"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Detail Nota & Pembayaran</h2>
              <p className="text-xs text-gray-500">Nota ID: #ORD{nota_id}</p>
            </div>
          </div>
          <button onClick={isClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <i className="fa fa-times text-xl"></i>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 bg-gray-50/30">
          
          {/* Section 1: Tabel Barang */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-700 uppercase">Daftar Barang Pembelian</h3>
              <div className="flex gap-2">
                {notaSt === "no" ? (
                  <button onClick={() => handleLunas("yes")} className="px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100">
                    <i className="fa fa-check mr-1"></i> Set Lunas
                  </button>
                ) : (
                  <button onClick={() => handleLunas("no")} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100">
                    <i className="fa fa-times mr-1"></i> Batal Lunas
                  </button>
                )}
                <button onClick={downloadImage} className="px-3 py-1.5 bg-teal-50 text-teal-600 border border-teal-200 rounded-lg text-xs font-bold hover:bg-teal-100">
                  <i className="fa fa-image mr-1"></i> Cetak Gambar
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className={`w-full text-left border-collapse ${blur ? "blur-sm" : ""}`}>
                <thead>
                  <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase">
                    <th className="py-3 px-4 border-r w-12 text-center">No</th>
                    <th className="py-3 px-4 border-r">Supplier</th>
                    <th className="py-3 px-4 border-r text-center">Tanggal</th>
                    <th className="py-3 px-4 border-r">Barang</th>
                    <th className="py-3 px-4 border-r text-center">Kotor</th>
                    <th className="py-3 px-4 border-r text-center">Bersih</th>
                    <th className="py-3 px-4 border-r text-right">Harga</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {datasPembelian && datasPembelian.map((nota_data) => {
                    const pembeliArr = nota_data.pembelian.pembelian_data;
                    const rowSpan = pembeliArr.length;
                    no++;
                    return (
                      <React.Fragment key={nota_data.id}>
                        <tr className="hover:bg-gray-50/50">
                          <td className="py-3 px-4 text-center font-medium border-r" rowSpan={rowSpan}>{no}</td>
                          <td className="py-3 px-4 font-bold text-gray-800 border-r uppercase" rowSpan={rowSpan}>
                            {nota_data.pembelian.suplier.suplier_nama}
                          </td>
                          <td className="py-3 px-4 text-center border-r" rowSpan={rowSpan}>
                            {FormatTanggal(nota_data.pembelian.pembelian_tgl)}
                          </td>
                          <td className="py-3 px-4 border-r">{pembeliArr[0].barang.nama}</td>
                          <td className="py-3 px-4 text-center border-r">{pembeliArr[0].pembelian_kotor}</td>
                          <td className="py-3 px-4 text-center border-r font-bold text-green-600">{pembeliArr[0].pembelian_bersih}</td>
                          <td className="py-3 px-4 text-right border-r">{RupiahFormat(pembeliArr[0].pembelian_harga)}</td>
                          <td className="py-3 px-4 text-right font-bold">{RupiahFormat(pembeliArr[0].pembelian_total)}</td>
                          <div className="hidden">{totalBeliFix += parseInt(pembeliArr[0].pembelian_total)}</div>
                        </tr>
                        {pembeliArr.slice(1).map((pemb, idx) => {
                          totalBeliFix += parseInt(pemb.pembelian_total);
                          return (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="py-3 px-4 border-r">{pemb.barang.nama}</td>
                              <td className="py-3 px-4 text-center border-r">{pemb.pembelian_kotor}</td>
                              <td className="py-3 px-4 text-center border-r font-bold text-green-600">{pemb.pembelian_bersih}</td>
                              <td className="py-3 px-4 text-right border-r">{RupiahFormat(pemb.pembelian_harga)}</td>
                              <td className="py-3 px-4 text-right font-bold">{RupiahFormat(pemb.pembelian_total)}</td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-teal-50/50 font-bold text-teal-800 border-t-2 border-teal-100">
                    <td colSpan="7" className="py-3 px-4 text-right">TOTAL NOTA</td>
                    <td className="py-3 px-4 text-right text-lg">{RupiahFormat(totalBeliFix)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Section 2: Cicilan & Bayar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50/50 text-sm font-bold text-gray-700">RIWAYAT CICILAN</div>
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase border-b">
                    <th className="py-3 px-4 text-center">Sisa</th>
                    <th className="py-3 px-4 text-center">Bayar</th>
                    <th className="py-3 px-4 text-center">Waktu</th>
                    <th className="py-3 px-4 text-center w-20">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-gray-50/50 font-bold">
                    <td className="py-3 px-4 text-center text-teal-700">{RupiahFormat(grandTtlPembelian)}</td>
                    <td className="py-3 px-4 text-center text-gray-400 italic">Mulai</td>
                    <td colSpan="2"></td>
                  </tr>
                  {dataBayar && dataBayar.map((val, key) => {
                    runningSisaHutang -= val.bayar_value;
                    return (
                      <tr key={key} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 text-center font-bold text-red-500">{RupiahFormat(runningSisaHutang)}</td>
                        <td className="py-3 px-4 text-center font-bold text-green-600">{RupiahFormat(val.bayar_value)}</td>
                        <td className="py-3 px-4 text-center text-[10px] text-gray-500">{formatDate(val.updated_at)}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => handleEdit(val.id)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><i className="fa fa-pen text-xs"></i></button>
                            <button onClick={() => handleDelete(val.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><i className="fa fa-trash text-xs"></i></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-4 tracking-widest">Tambah Pembayaran</h4>
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">Rp</span>
                    <input
                      className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      name="bayar_value"
                      required
                      placeholder="0"
                      value={bayarValue}
                      type="number"
                      onChange={handleInputChange}
                    />
                  </div>
                  <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700">Simpan</button>
                </form>
              </div>

              {!stEdit && (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="text-sm font-bold text-blue-700 uppercase mb-4 tracking-widest">Ubah Pembayaran</h4>
                  <form onSubmit={handleEditSubmit} className="flex gap-2">
                    <input
                      className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                      name="edit_bayar_value"
                      value={bayarEditValue}
                      type="number"
                      onChange={handleInputChange}
                    />
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">Update</button>
                    <button type="button" onClick={() => setstEdit(true)} className="px-3 py-2 bg-white text-gray-400 rounded-lg text-xs">Batal</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 border-t bg-white flex justify-end">
          <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50" onClick={isClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
}

export default ModalNota;