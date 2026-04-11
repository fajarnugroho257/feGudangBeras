import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import FormatTanggal from "../utilities/FormatTanggal";
import RupiahFormat from "../utilities/RupiahFormat";
import api from "../utilities/axiosInterceptor";

function ModalPreviewPembelian({ isOpen, onClose, pengiriman_id }) {
  // TOKEN
  const token = localStorage.getItem("token");
  //
  //
  const [dataSuplier, setDataSuplier] = useState([]);
  const [dataPembelian, setDataPembelian] = useState([]);
  //
  useEffect(() => {
    const toastId = toast.loading("Getting data...");
    const fectData = async () => {
      //fetching
      const response = await api.get(`/detail-Pengiriman/${pengiriman_id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
        },
      });
      if (response.status === 200) {
        setDataSuplier(response.data.data);
        setDataPembelian(response.data.data.listPembelian);
        //
        toast.update(toastId, {
          render: "Data getting successfully!",
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
    };
    //panggil method "fetchData"
    fectData();
  }, [pengiriman_id]);
  //
  const handlePrint = async () => {
  try {
    // Fungsi kirim data per-chunk
    const sendInChunks = async (characteristic, buffer) => {
      const CHUNK = 500; // aman < 512
      for (let i = 0; i < buffer.length; i += CHUNK) {
        const chunk = buffer.slice(i, i + CHUNK);
        await characteristic.writeValue(chunk);
        await new Promise((res) => setTimeout(res, 30)); // delay sedikit
      }
    };

    // ESC/POS Commands
    const ESC = "\x1B";
    const fontSmall = `${ESC}!\x01`; 
    const fontNormal = `${ESC}!\x00`;

    const tanggal = FormatTanggal(dataSuplier.pengiriman_tgl);
    const items = dataPembelian;
    const currentDateTime = getCurrentDateTime();

    const grandTotal = items.reduce(
      (sum, item) => sum + (parseInt(item.data_total) || 0),
      0
    );

    const columnWidths = [6, 5, 8, 7];

    const header =
      `${fontSmall}` +
      "Putra Cabe\n------------------------\n" +
      `Tanggal     : ${tanggal}\n` +
      `Nota Cetak  : ${currentDateTime[0]}\n` +
      `Nota Jam    : ${currentDateTime[1]}\n` +
      "-------------------------------\n" +
      formatRow(["Brg", "Ton", "Harga", "Total"], columnWidths) +
      "\n-------------------------------\n";

    const rows = items
      .map((item) =>
        formatRow(
          [
            item.data_merek,
            item.data_tonase.toString(),
            formatRupiah(parseInt(item.data_harga) || 0),
            formatRupiah(parseInt(item.data_total) || 0),
          ],
          columnWidths
        )
      )
      .join("\n");

    const footer =
      "-------------------------------\n" +
      formatRow(["Gr Tot", "", "", formatRupiah(grandTotal)], columnWidths) +
      "\n-------------------------------\n\n";

    // Gabungkan semua
    const nota = `${fontSmall}` + header + rows + "\n" + footer + `${fontSmall}`;

    console.log(nota);

    const printData = new TextEncoder().encode(nota);

    // Koneksi BLE
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(
      "000018f0-0000-1000-8000-00805f9b34fb"
    );
    const characteristic = await service.getCharacteristic(
      "00002af1-0000-1000-8000-00805f9b34fb"
    );

    // **FIX: KIRIM DATA DALAM CHUNK**
    await sendInChunks(characteristic, printData);

    console.log("Nota berhasil dicetak.");
  } catch (error) {
    console.error("Gagal mencetak nota:", error);
  }
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
  //
  let grand_total = 0;
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="bg-white h-full w-3/4 xl:w-[30%] xl:h-[50%] p-6 rounded-lg shadow-lg relative z-10">
        <div className="w-full h-[10%]">
          <h2 className="text-xl font-semibold mb-2 text-colorBlue font-poppins">
            Preview Nota
          </h2>
          <div className="h-[2px] w-full bg-colorBlue mb-4"></div>
        </div>
        <div className="w-full h-[80%] overflow-auto font-poppins text-sm">
          <table className=" my-3 w-full">
            <tr>
              <td className="">Tanggal</td>
              <td className="">:</td>
              <td className="">
                {dataSuplier.pengiriman_tgl &&
                  FormatTanggal(dataSuplier.pengiriman_tgl)}
              </td>
            </tr>
          </table>
          {/*  */}
          <table className=" my-3 w-full" id="myTable">
            <thead>
              <tr className="text-center">
                <th className="border border-black py-1 px-2">Nama Barang</th>
                <th className="border border-black py-1 px-2">Tonase</th>
                <th className="border border-black py-1 px-2">Harga</th>
                <th className="border border-black py-1 px-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {dataPembelian &&
                dataPembelian.map((value, index) => {
                  console.log(parseInt(value.data_total ?? 0));
                  grand_total += parseInt(value.data_total ?? 0);
                  return (
                    <tr>
                      <td className="border border-black py-1 px-2">
                        {value.data_merek}
                      </td>
                      <td className="border border-black py-1 px-2 text-center">
                        {value.data_tonase}
                      </td>
                      <td className="border border-black py-1 px-2 text-right">
                        {RupiahFormat(value.data_harga)}
                      </td>
                      <td className="border border-black py-1 px-2 text-right">
                        {RupiahFormat(value.data_total)}
                      </td>
                    </tr>
                  );
                })}
              <tr className="font-semibold">
                <td
                  className="border border-black py-1 px-2 text-right"
                  colSpan="3"
                >
                  Grand Total
                </td>
                <td className="border border-black py-1 px-2 text-right">
                  {RupiahFormat(grand_total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-full h-[10%]">
          <div className="flex justify-between">
            <button
              className="px-4 py-2 bg-colorBlue font-poppins text-white rounded"
              onClick={handlePrint}
            >
              Cetak
            </button>
            <button
              className="px-4 py-2 bg-colorGray border-2 border-colorBlue font-poppins text-colorBlue rounded hover:bg-slate-200"
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

export default ModalPreviewPembelian;
