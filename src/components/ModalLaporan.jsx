import React, { useState, useEffect } from "react";
import axios from "axios";
import RupiahFormat from "../utilities/RupiahFormat";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FormatTanggal from "../utilities/FormatTanggal";
import api from "../utilities/axiosInterceptor";

function ModalLaporan({ isOpen, onClose, suplier_tgl }) {
  // TOKEN
  const token = localStorage.getItem("token");
  //
  //
  const [blur, setBlur] = useState(true);
  const [datasPembelian, setDatasPembelian] = useState([]);
  const [datasPengiriman, setDatasPengiriman] = useState([]);
  //
  const [datasPemBarang, setDatasPemBarang] = useState([]);
  const [datasPengBarang, setDatasPengBarang] = useState([]);
  //
  const [bbnKardus, setBbnKardus] = useState([]);
  // sald0
  const [uang, setUang] = useState();
  const [ttlBebanLain, setTtlBebanLain] = useState(0);
  const [grandTotalPembelianCash, setGrandTotalPembelianCash] = useState(0);
  //
  const endPoint = "/detail-Laporan";
  //
  useEffect(() => {
    //function "fetchData"
    let params = {
      suplier_tgl: suplier_tgl,
    };
    setBlur(true);
    const fectData = async () => {
      const toastId = toast.loading("Getting data...");
      //fetching
      try {
        const response = await api.post(endPoint, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        // console.log(response.data);
        //get response data
        const pembelian = await response.data.data.pembelian;
        const pengiriman = await response.data.data.pengiriman;
        const pemBarang = await response.data.groupBarang.pemBarang;
        const pengBarang = await response.data.groupBarang.pengBarang;
        const resbbnKardus = await response.data.data.bbnKardus;
        const saldoBe = await response.data.data.saldo_be;
        const totalBebanLain = await response.data.data.totalBebanLain;
        // console.log(resbbnKardus);
        //
        if (response.status === 200) {
          toast.update(toastId, {
            render: "Getting data successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          setBlur(false);
        }
        console.log(pembelian);
        //assign response data to state "posts"
        setDatasPembelian(pembelian);
        setDatasPengiriman(pengiriman);
        //
        setDatasPemBarang(pemBarang);
        setDatasPengBarang(pengBarang);
        //
        setBbnKardus(resbbnKardus);
        // Uang
        setUang(RupiahFormat(saldoBe));
        setTtlBebanLain(totalBebanLain);
        // jumlah cash
        const resTotalPembelianCash = pembelian.reduce((total, item) => {
          return total + Number(item.ttlPembelianCash);
        }, 0);
        setGrandTotalPembelianCash(resTotalPembelianCash);
        setSisaUang(saldoBe - (resTotalPembelianCash + totalBebanLain));
      } catch (error) {
        alert(error.message);
      }
    };
    fectData();
  }, [suplier_tgl]);
  // console.log(datasPengBarang);
  // Menghitung grand total dari semua subItems
  const grandTotalPembelian = datasPembelian.reduce((total, item) => {
    // Menambahkan jumlah dari setiap subItem
    const subTotal = item.listPembelian.reduce(
      (subTotal, subItem) => subTotal + Number(subItem.pembelian_total),
      0,
    );
    return total + subTotal;
  }, 0);
  const grandTotalPengiriman = datasPengiriman.reduce((total, item) => {
    // Menambahkan jumlah dari setiap subItem
    const subTotal = item.listPengiriman.reduce(
      (subTotal, subItem) => subTotal + Number(subItem.data_total),
      0,
    );
    return total + subTotal;
  }, 0);

  const grandTotalBebanKaryawan = datasPengiriman.reduce((total, item) => {
    // Menambahkan jumlah dari setiap subItem
    const subTotal = item.bebanKaryawan.reduce(
      (subTotal, subItem) => subTotal + Number(subItem.beban_value),
      0,
    );
    return total + subTotal;
  }, 0);
  // console.log(grandTotalBebanKaryawan);
  const grandTotalBebanLain = datasPengiriman.reduce((total, item) => {
    // Menambahkan jumlah dari setiap subItem
    const subTotal = item.bebanLain.reduce(
      (subTotal, subItem) => subTotal + Number(subItem.beban_value),
      0,
    );
    return total + subTotal;
  }, 0);
  // console.log(grandTotalBebanLain);
  const granTtlBeban = grandTotalBebanKaryawan + grandTotalBebanLain;
  //   const grandTotal = 0;
  const laba =
    grandTotalPengiriman - grandTotalPembelian - granTtlBeban - bbnKardus;
  let ttl_ops_lain = 0;
  let ttl_ops_karyawan = 0;
  //
  let ttl_group_pembelian = 0;
  let ttl_pembelian = 0;
  let ttl_pengiriman = 0;
  let selisih = 0;
  // Uang
  const generateID = (dateString) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);

    return `${day}${month}${year}`;
  };
  const [sisaUang, setSisaUang] = useState(0);
  //
  const toNumber = (str) => {
    return Number(str.replace(/[^0-9]/g, ""));
  };
  const handleUang = (val) => {
    const uangVal = toNumber(val.target.value);
    const uangValRupiah = RupiahFormat(uangVal);
    setUang(uangValRupiah);
    setSisaUang(uangVal - (grandTotalPembelianCash + ttlBebanLain));
  };
  // simpan uang
  const simpanModal = async () => {
    const toastSaldo = toast.loading("Update Saldo");
    if (uang !== null) {
      try {
        const formData = {
          saldo_val: toNumber(uang),
          saldo_id: generateID(suplier_tgl),
        };
        const response = await api.post("/update-saldo", formData, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Sisipkan token di header
            "Content-Type": "application/json",
          },
        });
        toast.update(toastSaldo, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } catch (error) {
        console.log(error.message);
        toast.update(toastSaldo, {
          render: error.message,
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } else {
      toast.update(toastSaldo, {
        render: "Saldo belum diisi",
        type: "error",
        isLoading: false,
        autoClose: 1000,
      });
    }
  };
  // let resSelisih = 0;
  if (!isOpen) return null;
  // console.log(datasPengiriman);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="bg-white w-[90%] md:w-[95%] h-[95%] md:h-[95%] p-6 rounded-lg shadow-lg relative z-10">
        <div className="w-full md:h-[5%]">
          <h2 className="text-md md:text-xl font-semibold mb-2  font-poppins">
            Laba / Rugi ||{" "}
            <span className="text-red-600">{FormatTanggal(suplier_tgl)}</span>
          </h2>
        </div>
        <div className="h-[2px] w-full bg-colorBlue"></div>
        <div className="w-full h-[85%] overflow-auto text-sm md:text-md">
          <div className="md:grid md:grid-cols-2 my-3 gap-3">
            <table className="font-poppins font-semibold w-full md:w-1/2">
              <tr>
                <td className="w-[30%]">Pengiriman</td>
                <td className="w-[5%]">:</td>
                <td className="text-blue-600 w-[65%] text-right">
                  {RupiahFormat(grandTotalPengiriman)}
                </td>
              </tr>
              <tr>
                <td className="w-[25%]">Modal</td>
                <td className="w-[5%]">:</td>
                <td className="text-green-600 w-[70%] text-right">
                  {RupiahFormat(
                    parseInt(grandTotalPembelian) +
                      parseInt(granTtlBeban) +
                      parseInt(bbnKardus),
                  )}
                </td>
              </tr>
              <tr>
                <td colSpan="3">
                  <hr className="fill-black" />
                </td>
              </tr>
              <tr>
                <td className="w-[25%]">Laba / Rugi</td>
                <td className="w-[5%]">:</td>
                <td className="text-red-600 w-[70%] text-right">
                  {RupiahFormat(laba)}
                </td>
              </tr>
            </table>
            <hr className="my-4 md:hidden" />
            <div className="flex gap-4">
              <table className="font-poppins font-semibold w-full md:w-1/2">
                <tr>
                  <td className="w-[55%]">Uang Hari Ini</td>
                  <td className="w-[5%]">:</td>
                  <td className="text-end">
                    <input
                      type="text"
                      className="w-full p-1 border border-1 text-end text-blue-500"
                      onChange={(val) => handleUang(val)}
                      value={uang}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="">Pembelian (Cash)</td>
                  <td className="">:</td>
                  <td className="text-red-600 w-[70%] text-right">
                    -{RupiahFormat(grandTotalPembelianCash)}
                  </td>
                </tr>
                <tr>
                  <td className="">Ops Lainnya</td>
                  <td className="">:</td>
                  <td className="text-red-600 w-[70%] text-right">
                    -{RupiahFormat(ttlBebanLain)}
                  </td>
                </tr>
                <tr>
                  <td colSpan="3">
                    <hr className="fill-black" />
                  </td>
                </tr>
                <tr>
                  <td className="">Sisa Uang</td>
                  <td className="">:</td>
                  <td className="text-green-600 w-[70%] text-right">
                    {RupiahFormat(sisaUang)}
                  </td>
                </tr>
              </table>
              <div className="font-poppins font-semibold hidden md:block">
                <i
                  onClick={() => simpanModal()}
                  className="cursor-pointer bg-colorBlue p-2 text-white rounded-sm fa fa-save"
                ></i>{" "}
                Simpan
              </div>
            </div>
            <div className="md:hidden text-right w-full md:w-1/2">
              <i
                onClick={() => simpanModal()}
                className=" cursor-pointer bg-colorBlue p-2 text-white rounded-sm fa fa-save"
              ></i>
            </div>
          </div>
          <div className="w-full h-fit xl:grid xl:grid-cols-2 gap-3">
            <div className="w-full">
              {/* <hr className="bg-colorBlue py-[1px] my-3" /> */}
              <h3 className="mt-2 font-poppins font-semibold">Pembelian</h3>
              <table className="mt-2 w-full text-center font-poppins text-sm">
                <tr className="bg-colorBlue text-white">
                  <td className="border border-black w-[15%]">Suplier</td>
                  <td className="border border-black w-[13%]">Barang</td>
                  <td className="border border-black w-[10%]">Kotor</td>
                  <td className="border border-black w-[3%]">Potongan</td>
                  <td className="border border-black w-[12%]">Bersih</td>
                  <td className="border border-black w-[17%]">Harga</td>
                  <td className="border border-black w-[15%]">Total</td>
                  <td className="border border-black w-[15%]">TTL Beli</td>
                </tr>
                {datasPembelian.length >= 1 ? (
                  datasPembelian.map((item, index) => {
                    const pembelian = item.listPembelian;
                    const pembelian_pertama =
                      item.listPembelian["0"]["pembelian_nama"];
                    const pembelian_kotor =
                      item.listPembelian["0"]["pembelian_kotor"];
                    const pembelian_bersih =
                      item.listPembelian["0"]["pembelian_bersih"];
                    const pembelian_potongan =
                      item.listPembelian["0"]["pembelian_potongan"];
                    const pembelian_harga =
                      item.listPembelian["0"]["pembelian_harga"];
                    const total_pertama =
                      item.listPembelian["0"]["pembelian_total"];
                    const pembayaran_pertama =
                      item.listPembelian["0"]["pembayaran"];
                    return (
                      <>
                        <tr
                          key={index}
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-gray-300"
                          }`}
                        >
                          <td
                            rowSpan={item.listPembelian.length}
                            className="border border-black"
                          >
                            {item.suplier_nama}
                          </td>
                          <td className="border border-black">
                            {pembelian_pertama}
                          </td>
                          <td className="border border-black">
                            {pembelian_kotor}
                          </td>
                          <td className="border border-black">
                            {pembelian_potongan}
                          </td>
                          <td className="border border-black">
                            {pembelian_bersih}
                          </td>
                          <td className="border border-black px-1 text-right">
                            {RupiahFormat(pembelian_harga)}
                          </td>
                          <td
                            className={`border border-black px-1 text-right ${pembayaran_pertama == "cash" ? "bg-green-500 text-white" : ""}`}
                          >
                            {RupiahFormat(total_pertama)}
                          </td>
                          <td
                            rowSpan={item.listPembelian.length}
                            className="border border-black px-1 text-right"
                          >
                            {RupiahFormat(item.ttlPembelian)}
                          </td>
                        </tr>
                        {pembelian &&
                          pembelian.map((pem, key) => {
                            return (
                              <>
                                {JSON.stringify(key) === "0" ? null : (
                                  <tr
                                    key={index + key}
                                    className={`${
                                      index % 2 === 0
                                        ? "bg-gray-50"
                                        : "bg-gray-300"
                                    }`}
                                  >
                                    <td className="border border-black">
                                      {pem.pembelian_nama}
                                    </td>
                                    <td className="border border-black">
                                      {pem.pembelian_kotor}
                                    </td>
                                    <td className="border border-black">
                                      {pem.pembelian_potongan}
                                    </td>
                                    <td className="border border-black">
                                      {pem.pembelian_bersih}
                                    </td>
                                    <td className="border border-black px-1 text-right">
                                      {RupiahFormat(pem.pembelian_harga)}
                                    </td>
                                    <td
                                      className={`border border-black px-1 text-right ${pem.pembayaran == "cash" ? "bg-green-500 text-white" : ""}`}
                                    >
                                      {RupiahFormat(pem.pembelian_total)}
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })}
                      </>
                    );
                  })
                ) : (
                  <tr>
                    <td className="boder border-black">Data tidak ditemukan</td>
                  </tr>
                )}
                <tr>
                  <td
                    className="border border-black text-right font-semibold px-1"
                    colSpan="7"
                  >
                    Grand Total
                  </td>
                  <td className="border border-black font-semibold text-green-600 px-1 text-right">
                    {RupiahFormat(grandTotalPembelian)}
                  </td>
                </tr>
              </table>
            </div>
            <div className="w-full">
              {/* <hr className="bg-colorBlue py-[1px] my-3" /> */}
              <h3 className="mt-2 font-poppins font-semibold">Pengiriman</h3>
              <table className="mt-2 w-full text-center font-poppins text-sm">
                <tr className="bg-colorBlue text-white">
                  <td className="border border-black w-[20%]">Merek</td>
                  <td className="border border-black w-[16%]">Nama Barang</td>
                  <td className="border border-black w-[12%]">Kardus</td>
                  <td className="border border-black w-[12%]">Tonase</td>
                  <td className="border border-black w-[20%]">Harga</td>
                  <td className="border border-black w-[20%]">Total</td>
                </tr>
                {datasPengiriman.length >= 1 ? (
                  datasPengiriman.map((item, index) => {
                    const pembelian = item.listPengiriman;
                    const data_barang = item.listPengiriman["0"]["data_barang"];
                    const data_merek = item.listPengiriman["0"]["data_merek"];
                    const data_box = item.listPengiriman["0"]["data_box"];
                    const data_tonase = item.listPengiriman["0"]["data_tonase"];
                    const data_harga = item.listPengiriman["0"]["data_harga"];
                    const total_pertama =
                      item.listPengiriman["0"]["data_total"];
                    return (
                      <>
                        <tr
                          key={index}
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-gray-300"
                          }`}
                        >
                          <td className="border border-black">{data_merek}</td>
                          <td className="border border-black">{data_barang}</td>
                          <td className="border border-black">{data_box}</td>
                          <td className="border border-black">{data_tonase}</td>
                          <td className="border border-black px-1 text-right">
                            {RupiahFormat(data_harga)}
                          </td>
                          <td className="border border-black px-1 text-right">
                            {RupiahFormat(total_pertama)}
                          </td>
                        </tr>
                        {pembelian &&
                          pembelian.map((pem, key) => {
                            return (
                              <>
                                {JSON.stringify(key) === "0" ? null : (
                                  <tr
                                    y={index + key}
                                    className={`${
                                      key % 2 === 0
                                        ? "bg-gray-50"
                                        : "bg-gray-300"
                                    }`}
                                  >
                                    <td className="border border-black">
                                      {pem.data_merek}
                                    </td>
                                    <td className="border border-black">
                                      {pem.data_barang}
                                    </td>
                                    <td className="border border-black">
                                      {pem.data_box}
                                    </td>
                                    <td className="border border-black">
                                      {pem.data_tonase}
                                    </td>
                                    <td className="border border-black px-1 text-right">
                                      {RupiahFormat(pem.data_harga)}
                                    </td>
                                    <td className="border border-black px-1 text-right">
                                      {RupiahFormat(pem.data_total)}
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })}
                      </>
                    );
                  })
                ) : (
                  <tr>
                    <td className="boder border-black">Data tidak ditemukan</td>
                  </tr>
                )}
                <tr>
                  <td
                    className="border border-black font-semibold text-right px-1"
                    colSpan="5"
                  >
                    Grand Total
                  </td>
                  <td className="border border-black font-semibold text-blue-600 px-1 text-right">
                    {RupiahFormat(grandTotalPengiriman)}
                  </td>
                </tr>
              </table>
            </div>
            {/* tabel group by nama */}
            <div className="w-full">
              {/* <hr className="bg-colorBlue py-[1px] my-3" /> */}
              <h3 className="mt-2 font-poppins font-semibold">
                Group Barang Pembelian
              </h3>
              <table className="mt-2 w-full text-center font-poppins text-sm">
                <tr className="bg-colorBlue text-white">
                  <td className="border border-black">Nama Barang</td>
                  <td className="border border-black">Tonase Kotor</td>
                  <td className="border border-black">Total</td>
                </tr>
                {datasPemBarang.length >= 1 ? (
                  datasPemBarang.map((item, index) => {
                    ttl_group_pembelian += parseInt(item.ttlGroupTotal);
                    return (
                      <>
                        <tr
                          key={index}
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-gray-300"
                          }`}
                        >
                          <td className="border border-black">
                            {item.pembelian_nama}
                          </td>
                          <td className="border border-black">
                            {item.ttlGroupBarang}
                          </td>
                          <td className="border border-black px-2 text-right">
                            {RupiahFormat(item.ttlGroupTotal)}
                          </td>
                        </tr>
                      </>
                    );
                  })
                ) : (
                  <tr>
                    <td className="boder border-black">Data tidak ditemukan</td>
                  </tr>
                )}
                <tr>
                  <td className="border border-black" colSpan="2">
                    Total
                  </td>
                  <td className="border border-black font-bold font-poppins text-green-600 px-2 text-right">
                    {RupiahFormat(ttl_group_pembelian)}
                  </td>
                </tr>
              </table>
            </div>
            {/* tabel group by nama */}
            <div className="w-full">
              {/* <hr className="bg-colorBlue py-[1px] my-3" /> */}
              <h3 className="mt-2 font-poppins font-semibold">
                Group Barang Pengiriman
              </h3>
              <table className="mt-2 w-full text-center text-sm font-poppins">
                <tr className="bg-colorBlue text-white">
                  <td className="border border-black">Nama Barang</td>
                  <td className="border border-black">Tonase Pembelian</td>
                  <td className="border border-black">Tonase pengiriman</td>
                  <td className="border border-black">Status</td>
                </tr>
                {datasPengBarang.length >= 1 ? (
                  datasPengBarang.map((item, index) => {
                    ttl_pembelian += parseFloat(item.pembelian);
                    ttl_pengiriman += parseFloat(item.pengiriman);
                    selisih = ttl_pembelian - ttl_pengiriman;
                    let resSelisih =
                      parseFloat(item.pembelian) - parseFloat(item.pengiriman);
                    return (
                      <>
                        <tr
                          key={index}
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-gray-300"
                          }`}
                        >
                          <td className="border border-black">{item.barang}</td>
                          <td className="border border-black">
                            {item.pembelian}
                          </td>
                          <td className="border border-black">
                            {item.pengiriman}
                          </td>
                          <td className="border border-black font-poppins text-sm">
                            {parseFloat(item.pembelian) <
                            parseFloat(item.pengiriman) ? (
                              <span className="">
                                {Number(resSelisih.toFixed(2))}
                                <i className="ml-1 fa fa-arrow-up text-green-500"></i>
                              </span>
                            ) : (
                              <span className="">
                                {Number(resSelisih.toFixed(2))}
                                <i className="ml-1 fa fa-arrow-down text-red-500"></i>
                              </span>
                            )}
                          </td>
                        </tr>
                      </>
                    );
                  })
                ) : (
                  <tr>
                    <td className="boder border-black">Data tidak ditemukan</td>
                  </tr>
                )}
                <tr className="font-semibold font-poppins">
                  <td className="border border-black">Total</td>
                  <td className="border border-black">
                    {Number(ttl_pembelian.toFixed(2))}
                  </td>
                  <td className="border border-black">
                    {Number(ttl_pengiriman.toFixed(2))}
                  </td>
                  <td className="border border-black font-poppins text-sm">
                    {ttl_pengiriman > ttl_pembelian ? (
                      <span className="">
                        {Number(selisih.toFixed(2))}
                        <i className="ml-1 fa fa-arrow-up text-green-500"></i>
                      </span>
                    ) : (
                      <span className="">
                        {Number(selisih.toFixed(2))}
                        <i className="ml-1 fa fa-arrow-down text-red-500"></i>
                      </span>
                    )}
                  </td>
                </tr>
              </table>
            </div>
            <div>
              <h1 className="font-poppins text-lg text-colorBlue font-semibold">
                Total Operasional :{" "}
                {RupiahFormat(parseInt(granTtlBeban) + parseInt(bbnKardus))}
              </h1>
            </div>
            <div></div>
            <div className="w-full">
              {/* <hr className="bg-colorBlue py-[1px] my-3" /> */}
              <h3 className="mt-2 font-poppins font-semibold">
                Operasional Karyawan
              </h3>
              <table className="mt-2 w-full text-center text-sm font-poppins">
                <tr key="Operasional" className="bg-colorBlue text-white">
                  <td className="border border-black">Nama</td>
                  <td className="border border-black">Nilai</td>
                </tr>
                {datasPengiriman.length >= 1 ? (
                  datasPengiriman.map((item, index) => {
                    const { bebanKaryawan } = item;
                    return bebanKaryawan.map((item_beban, index_2) => {
                      ttl_ops_karyawan += parseInt(item_beban.beban_value, 10);
                      return (
                        <tr key={`${index}-${index_2}`}>
                          <td className="border border-black">
                            {item_beban.karyawan.karyawan_nama}
                          </td>
                          <td className="border border-black">
                            {RupiahFormat(item_beban.beban_value)}
                          </td>
                        </tr>
                      );
                    });
                  })
                ) : (
                  <tr>
                    <td className="boder border-black">Data tidak ditemukan</td>
                  </tr>
                )}
                <tr className="">
                  <td className="border border-black font-semibold">Total</td>
                  <td className="border border-black font-semibold">
                    {RupiahFormat(ttl_ops_karyawan)}
                  </td>
                </tr>
              </table>
            </div>
            <div className="w-full">
              {/* <hr className="bg-colorBlue py-[1px] my-3" /> */}
              <h3 className="mt-2 font-poppins font-semibold">
                Operasional Lainnya
              </h3>
              <div className="w-full flex gap-4">
                <div className="w-1/2">
                  <table className="mt-2 w-full text-center text-sm font-poppins">
                    <tr key="Operasional" className="bg-colorBlue text-white">
                      <td className="border border-black">Nama</td>
                      <td className="border border-black">Nilai</td>
                    </tr>
                    {datasPengiriman.length >= 1 ? (
                      datasPengiriman.map((item, index) => {
                        const { bebanLain } = item;
                        return bebanLain.map((item_beban, index_2) => {
                          ttl_ops_lain += parseInt(item_beban.beban_value, 10);
                          return (
                            <tr key={`${index}-${index_2}`}>
                              <td className="border border-black">
                                {item_beban.beban_nama}
                              </td>
                              <td className="border border-black">
                                {RupiahFormat(item_beban.beban_value)}
                              </td>
                            </tr>
                          );
                        });
                      })
                    ) : (
                      <tr>
                        <td className="boder border-black">
                          Data tidak ditemukan
                        </td>
                      </tr>
                    )}
                    <tr className="">
                      <td className="border border-black font-semibold">
                        Total
                      </td>
                      <td className="border border-black font-semibold">
                        {RupiahFormat(ttl_ops_lain)}
                      </td>
                    </tr>
                  </table>
                </div>
                <div className="w-1/2">
                  <table className="mt-2 w-full text-center font-poppins text-sm">
                    <tr className="bg-colorBlue text-white">
                      <td className="border border-black font-semibold">
                        Kardus
                      </td>
                      <td className="border border-black font-semibold">
                        {RupiahFormat(bbnKardus)}
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-[5%] mt-2">
          <div className="flex justify-end">
            <button
              className="px-2 py-1 bg-colorGray border-2 border-colorBlue font-poppins text-colorBlue rounded hover:bg-slate-200"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalLaporan;
