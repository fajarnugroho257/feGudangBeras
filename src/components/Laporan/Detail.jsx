import React, { useEffect, useState } from "react";
import { getToken } from "../../utilities/Auth";
import Input from "../../components/Ui/Input"; // Pastikan path ini benar
import { toast } from "react-toastify";
import api from "../../utilities/axiosInterceptor";
import Select from "react-select";
import RupiahFormat from "../../utilities/RupiahFormat";
import FormatTanggal from "../../utilities/FormatTanggal";

function Detail({ tanggal, isOpen, onClose, reload }) {
  // TOKEN
  const token = localStorage.getItem("token");
  const endPointDetail = "/detail-data-laporan";
  //
  const tipeColors = {
    beras: "bg-emerald-600 border-emerald-700",
    gabah: "bg-amber-500 border-amber-600",
    katul: "bg-orange-700 border-orange-800",
    sekam: "bg-slate-600 border-slate-700",
  };

  const [dataPembelian, setDataPembelian] = useState([]);
  const [dataPengiriman, setDataPengiriman] = useState([]);
  const [stModalBeban, setStModalBeban] = useState(false);
  const [bebanOpsKaryawan, setBebanOpsKaryawan] = useState([]);
  const [bebanOpsLain, setBebanOpsLain] = useState([]);

  let ttl_total = 0;
  let ttlAllPembelian = 0;
  let ttlAllPenjualan = 0;
  let ttl_tonase_kotor = 0;
  let ttl_tonase_potongan = 0;
  let ttl_tonase_bersih = 0;
  let numberPembelian = 0;
  let numberPengiriman = 0;
  let ttl_tonase_kirim = 0;
  let bebanKaryawan = [];
  let bebanLain = [];
  let ttlAllBeban = 0;
  let ttlOpsKaryawan = 0;
  let ttlOpsLain = 0;

  const loadData = async (tanggal) => {
    try {
      const response = await api.get(`${endPointDetail}/${tanggal}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      //get response data
      const pembelian = await response.data.pembelian;
      const pengiriman = await response.data.pengiriman;
      setDataPembelian(pembelian);
      setDataPengiriman(pengiriman);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleBeban = (karyawan, lain) => {
    setStModalBeban(!stModalBeban);
    setBebanOpsKaryawan(karyawan);
    setBebanOpsLain(lain);
  };

  useEffect(() => {
    loadData(tanggal);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 font-poppins">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="bg-white w-[90%] h-full rounded-2xl shadow-2xl relative z-10 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 md:px-8 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
              <i className="fa fa-box-open text-lg"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 leading-tight">
                Detail Laporan Barang
              </h2>
              <p className="text-xs text-gray-500">Pamasukkan & pengeluaran</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <i className="fa fa-times text-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 md:px-8 bg-gray-50/30 overflow-y-auto">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4 overflow-y-auto">
            <div className="overflow-x-auto">
              <h5 className="font-bold mb-2">Data Pembelian</h5>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className="bg-gray-50/80 border-b border-gray-200"
                    key="head-pembelian"
                  >
                    <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">
                      No
                    </th>
                    <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Suplier
                    </th>
                    <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Barang
                    </th>
                    <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">
                      Tipe
                    </th>
                    <th
                      className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200"
                      title="Tonase Kotor"
                    >
                      T. Kotor (Kg)
                    </th>
                    <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">
                      Pot. (kg)
                    </th>
                    <th
                      className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200"
                      title="Tonase Bersih"
                    >
                      T. Bersih (Kg)
                    </th>
                    <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200">
                      Harga
                    </th>
                    <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200">
                      Subtotal
                    </th>
                    <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">
                      Status
                    </th>
                    <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right border-r border-gray-200">
                      Total All
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y divide-gray-100"
                  key="t-body-pembelian"
                >
                  {dataPembelian &&
                    dataPembelian.map((item, index) => {
                      numberPembelian++;
                      let pembelianData = item.pembelian_data;
                      let ttlPembelian = pembelianData.length;
                      let firstPembelian = pembelianData[0];
                      ttl_tonase_kotor += parseInt(
                        firstPembelian.pembelian_kotor,
                      );
                      ttl_tonase_potongan += parseInt(
                        firstPembelian.pembelian_potongan,
                      );
                      ttl_tonase_bersih += parseInt(
                        firstPembelian.pembelian_bersih,
                      );

                      ttl_total += parseInt(firstPembelian.pembelian_total);
                      ttlAllPembelian += parseInt(item.total_pembelian_total);
                      return (
                        <>
                          <tr className="" key={"pembelian" + index}>
                            <td
                              className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3"
                              rowSpan={ttlPembelian}
                            >
                              {numberPembelian}
                            </td>
                            <td
                              className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3"
                              rowSpan={ttlPembelian}
                            >
                              {item.suplier.suplier_nama}
                            </td>
                            <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                              {firstPembelian.barang.nama}
                            </td>
                            <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold text-white border uppercase tracking-widest shadow-sm transition-colors ${
                                  tipeColors[
                                    firstPembelian.barang.tipe?.toLowerCase()
                                  ] || "bg-teal-600 border-teal-700"
                                }`}
                              >
                                {firstPembelian.barang.tipe}
                              </span>
                            </td>
                            <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                              {firstPembelian.pembelian_kotor}
                            </td>
                            <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                              {firstPembelian.pembelian_potongan}
                            </td>
                            <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                              {firstPembelian.pembelian_bersih}
                            </td>
                            <td className="align-middle text-right border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                              {RupiahFormat(firstPembelian.pembelian_harga)}
                            </td>
                            <td className="align-middle text-right border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                              {RupiahFormat(firstPembelian.pembelian_total)}
                            </td>
                            <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                                  firstPembelian.pembayaran === "cash"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {firstPembelian.pembayaran}
                              </span>
                            </td>
                            <td
                              className="align-middle text-right border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3 pr-3"
                              rowSpan={ttlPembelian}
                            >
                              {RupiahFormat(item.total_pembelian_total)}
                            </td>
                          </tr>
                          {pembelianData &&
                            pembelianData.map((item2, idx2) => {
                              if (idx2 > 0) {
                                ttl_tonase_kotor += parseInt(
                                  item2.pembelian_kotor,
                                );
                                ttl_tonase_potongan += parseInt(
                                  item2.pembelian_potongan,
                                );
                                ttl_tonase_bersih += parseInt(
                                  item2.pembelian_bersih,
                                );
                                ttl_total += parseInt(item2.pembelian_total);
                                return (
                                  <>
                                    <tr key={"pem" + idx2}>
                                      <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                        {item2.barang.nama}
                                      </td>
                                      <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold text-white border uppercase tracking-widest shadow-sm transition-colors ${
                                            tipeColors[
                                              item2.barang.tipe?.toLowerCase()
                                            ] || "bg-teal-600 border-teal-700"
                                          }`}
                                        >
                                          {item2.barang.tipe}
                                        </span>
                                      </td>
                                      <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                        {item2.pembelian_kotor}
                                      </td>
                                      <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                        {item2.pembelian_potongan}
                                      </td>
                                      <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                        {item2.pembelian_bersih}
                                      </td>
                                      <td className="align-middle text-right border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                        {RupiahFormat(item2.pembelian_harga)}
                                      </td>
                                      <td className="align-middle text-right border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                        {RupiahFormat(item2.pembelian_total)}
                                      </td>
                                      <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                        <span
                                          className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                                            item2.pembayaran === "cash"
                                              ? "bg-green-100 text-green-700"
                                              : "bg-red-100 text-red-700"
                                          }`}
                                        >
                                          {item2.pembayaran}
                                        </span>
                                      </td>
                                    </tr>
                                  </>
                                );
                              }
                            })}
                        </>
                      );
                    })}

                  <tr
                    key="jumlah"
                    className="bg-gray-100/80 border-t-2 border-gray-300"
                  >
                    <td
                      colSpan="4"
                      className="text-right py-3 px-4 text-sm font-bold text-gray-700 tracking-wider border-r border-gray-300"
                    >
                      TOTAL KESELURUHAN
                    </td>

                    <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3">
                      {ttl_tonase_kotor}
                    </td>
                    <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3">
                      {ttl_tonase_potongan}
                    </td>
                    <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3">
                      {ttl_tonase_bersih}
                    </td>
                    <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3"></td>
                    <td className="align-middle text-right border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3">
                      {RupiahFormat(ttl_total)}
                    </td>
                    <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3"></td>
                    <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3">
                      {RupiahFormat(ttlAllPembelian)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto">
              <h5 className="font-bold mb-2">Data Pengiriman</h5>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-12">
                      No
                    </th>
                    <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-40">
                      Nama Pembeli
                    </th>
                    <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-32">
                      Uang Muka
                    </th>
                    <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-24">
                      Status
                    </th>
                    <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-36">
                      Operasional
                    </th>
                    <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-40">
                      Barang
                    </th>
                    <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-24">
                      Suplier
                    </th>
                    <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-32">
                      Tonase
                    </th>
                    <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-32">
                      Pembayaran
                    </th>
                    <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-36">
                      Total Biaya
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y divide-gray-100"
                  key="t-body-pembelian"
                >
                  {dataPengiriman &&
                    dataPengiriman.map((item, index) => {
                      numberPengiriman++;
                      let pengirimanData = item.pengiriman_data;
                      let ttlPengiriman = pengirimanData.length;
                      let firstPembelian = pengirimanData[0];
                      ttl_tonase_kirim += parseInt(firstPembelian.data_tonase);
                      ttl_total += parseInt(firstPembelian.pembelian_total);
                      ttlAllPenjualan += parseInt(item.total_biaya);
                      bebanKaryawan = item.pengiriman_beban_karyawan;
                      bebanLain = item.pengiriman_beban_lain;
                      const totalBebanKaryawan = bebanKaryawan.reduce(
                        (total, item) => {
                          return total + Number(item.beban_value);
                        },
                        0,
                      );
                      const totalBebanLain = bebanLain.reduce((total, item) => {
                        return total + Number(item.beban_value);
                      }, 0);
                      ttlAllBeban += totalBebanKaryawan + totalBebanLain;
                      return (
                        <>
                          <tr className="" key={"Penjualan" + index}>
                            <td
                              className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3"
                              rowSpan={ttlPengiriman}
                            >
                              {numberPengiriman}
                            </td>
                            <td
                              className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3"
                              rowSpan={ttlPengiriman}
                            >
                              {item.nama_pembeli}
                            </td>
                            <td
                              rowSpan={ttlPengiriman}
                              className="align-middle text-right border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3"
                            >
                              {RupiahFormat(item.uang_muka)}
                            </td>
                            <td
                              rowSpan={ttlPengiriman}
                              className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3"
                            >
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wider">
                                {item.status}
                              </span>
                            </td>
                            <td
                              rowSpan={ttlPengiriman}
                              className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3"
                            >
                              <div className="flex items-center justify-end gap-3">
                                {RupiahFormat(
                                  totalBebanKaryawan + totalBebanLain,
                                )}
                                <button
                                  onClick={() =>
                                    handleBeban(
                                      item.pengiriman_beban_karyawan,
                                      item.pengiriman_beban_lain,
                                    )
                                  }
                                  className="w-7 h-7 flex items-center justify-center bg-teal-50 text-teal-600 rounded hover:bg-teal-100 transition-colors border border-teal-100"
                                  title="Atur Operational"
                                >
                                  <i className="fa fa-book text-sm"></i>
                                </button>
                              </div>
                            </td>
                            <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                              {firstPembelian.barang.nama}
                            </td>
                            <td className="align-middle border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                              {firstPembelian.suplier.suplier_nama}
                            </td>
                            <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                              {firstPembelian.data_tonase}
                            </td>
                            <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                                  firstPembelian.pembayaran_st === "cash"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {firstPembelian.pembayaran_st}
                              </span>
                            </td>
                            <td
                              rowSpan={ttlPengiriman}
                              className="align-middle text-right border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3"
                            >
                              {RupiahFormat(item.total_biaya)}
                            </td>
                          </tr>
                          {pengirimanData &&
                            pengirimanData.map((item2, idx2) => {
                              if (idx2 > 0) {
                                ttl_tonase_kirim += parseInt(item2.data_tonase);
                                ttl_total += parseInt(item2.pembelian_total);
                                return (
                                  <>
                                    <tr key={"Penjualan_2" + index}>
                                      <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                        {item2.barang.nama}
                                      </td>
                                      <td className="align-middle border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                        {item2.suplier.suplier_nama}
                                      </td>
                                      <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                        {item2.data_tonase}
                                      </td>
                                      <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                        <span
                                          className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                                            item2.pembayaran_st === "cash"
                                              ? "bg-green-100 text-green-700"
                                              : "bg-red-100 text-red-700"
                                          }`}
                                        >
                                          {item2.pembayaran_st}
                                        </span>
                                      </td>
                                    </tr>
                                  </>
                                );
                              }
                            })}
                        </>
                      );
                    })}

                  <tr
                    key="jumlah"
                    className="bg-gray-100/80 border-t-2 border-gray-300"
                  >
                    <td
                      colSpan="2"
                      className="text-right py-3 px-4 text-sm font-bold text-gray-700 tracking-wider border-r border-gray-300"
                    >
                      TOTAL KESELURUHAN
                    </td>

                    <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3"></td>
                    <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3"></td>
                    <td className="align-middle text-right border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3">
                      {RupiahFormat(ttlAllBeban)}
                    </td>
                    <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3"></td>
                    <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3">
                      -
                    </td>
                    <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3">
                      {ttl_tonase_kirim}
                    </td>
                    <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3">
                      -
                    </td>
                    <td className="align-middle text-right border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3">
                      {RupiahFormat(ttlAllPenjualan)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 md:px-8 bg-white border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            onClick={onClose}
          >
            Tutup
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <i className="fa fa-print"></i> Cetak
          </button>
        </div>
      </div>
      {/*  */}
      {stModalBeban && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6 font-poppins">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            // onClick={() => handleModalBeban()}
          ></div>

          <div className="bg-white w-full max-w-2xl h-full max-h-[85vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                  <i className="fa fa-money-bill-wave text-lg"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 leading-tight">
                    Operasional
                  </h2>
                  <p className="text-xs text-gray-500">
                    Beban dan pengeluaran pengiriman
                  </p>
                </div>
              </div>
              <button
                // onClick={() => handleModalBeban()}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <i className="fa fa-times text-lg"></i>
              </button>
            </div>

            {/* Body Modal (Form) */}
            <div className="flex-1 overflow-y-auto p-5 bg-gray-50/30">
              {/* 2. Karyawan */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-5">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 border-b border-gray-100 pb-2">
                  1. Operasional Karyawan
                </h3>

                <div className="space-y-3 mb-3">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr
                        className="bg-gray-50/80 border-b border-gray-200"
                        key="aa"
                      >
                        <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">
                          No
                        </th>
                        <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">
                          Nama
                        </th>
                        <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">
                          Nilai
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bebanOpsKaryawan &&
                        bebanOpsKaryawan.map((val, index) => {
                          ttlOpsKaryawan += parseInt(val.beban_value);
                          return (
                            <tr>
                              <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                {index + 1}
                              </td>
                              <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                {val.karyawan.karyawan_nama}
                              </td>
                              <td className="align-middle text-right border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                {RupiahFormat(val.beban_value)}
                              </td>
                            </tr>
                          );
                        })}
                      <tr>
                        <td
                          className="align-middle text-right border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3"
                          colSpan={2}
                        >
                          Total
                        </td>
                        <td className="align-middle text-right border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3">
                          {RupiahFormat(ttlOpsKaryawan)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              {/* 3. Lainnya */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-5">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 border-b border-gray-100 pb-2">
                  2. Operasional Lainnya
                </h3>

                <div className="space-y-3 mb-3">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr
                        className="bg-gray-50/80 border-b border-gray-200"
                        key="aa"
                      >
                        <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">
                          No
                        </th>
                        <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">
                          Nama
                        </th>
                        <th className="py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200">
                          Nilai
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bebanOpsLain &&
                        bebanOpsLain.map((val, index) => {
                          ttlOpsLain += parseInt(val.beban_value);
                          return (
                            <tr>
                              <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                {index + 1}
                              </td>
                              <td className="align-middle text-center border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                {val.beban_nama}
                              </td>
                              <td className="align-middle text-right border-r border-b border-gray-200 text-sm text-gray-600 font-medium py-2 px-3">
                                {RupiahFormat(val.beban_value)}
                              </td>
                            </tr>
                          );
                        })}
                      <tr>
                        <td
                          className="align-middle text-right border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3"
                          colSpan={2}
                        >
                          Total
                        </td>
                        <td className="align-middle text-right border-r border-b border-gray-200 text-sm text-gray-600 font-bold py-2 px-3">
                          {RupiahFormat(ttlOpsLain)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <h5 className="font-bold text-green-600">
                Total Beban : {RupiahFormat(ttlOpsLain + ttlOpsKaryawan)}
              </h5>
            </div>

            {/* Footer Modal */}
            <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setStModalBeban(false)}
                type="button"
                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Detail;
