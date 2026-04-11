import React, { useState, useEffect } from "react";
import axios from "axios";
import RupiahFormat from "../utilities/RupiahFormat";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import api from "../utilities/axiosInterceptor";

function TambahKardus() {
  // TOKEN
  const token = localStorage.getItem("token");
  //
  const [blur, setBlur] = useState(true);
  const [datas, setDatas] = useState([]);
  const [stModalEdit, setStModalEdit] = useState(false);

  useEffect(() => {
    setBlur(true);
    const fectData = async () => {
      //fetching
      const response = await api.get("/index-Kardus", {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      //get response data
      const data = await response.data.dataKardus;
      //   console.log(data);
      //
      if (response.status === 200) {
        setBlur(false);
      }
      //assign response data to state "posts"
      setDatas(data);
    };
    fectData();
  }, [stModalEdit]);

  const [formData, setFormData] = useState({
    jumlah: "",
    Harga: "",
  });

  const handleModalEdit = () => {
    setStModalEdit(!stModalEdit);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEdit = async (id) => {
    // alert(id);
    const toastId = toast.loading("Sending data...");
    try {
      const response = await api.get(`/detail-Kardus/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      // console.log(response.data.data);
      if (response.status) {
        setFormData({
          harga: response.data.data.harga,
          jumlah: response.data.data.jumlah,
          id: response.data.data.id,
        });
        toast.update(toastId, {
          render: "Data geting successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        handleModalEdit();
      } else {
        toast.update(toastId, {
          render: "Error geting data!" + response.status,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Error sending data!" + error,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Sending data...");
    try {
      const response = await api.post("/edit-Kardus", formData, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
          "Content-Type": "application/json",
        },
      });

      if (response.status) {
        // const result = await response.json();
        toast.update(toastId, {
          render: "Data sent successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        handleModalEdit();
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
        render: "Error sending data!" + error,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const navigate = useNavigate();
  const handleTab = (event) => {
    navigate(`/${event}`);
  };
  let [number] = useState(0);
  //
  return (
    <>
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
              <h3 className="text-colorBlue text-sm xl:text-lg font-bold ">
                Kardus
              </h3>
            </div>
          </div>
          <div className="h-[2px] w-full bg-colorBlue mb-4"></div>
          <div className="h-[10%]"></div>
          <div className="h-[94%] md:h-[95%] ">
            <div className="overflow-x-auto">
              <table className="w-full font-poppins text-xs xl:text-md">
                <tr className="w-full text-white text-center font-poppins text-xs xl:text-md bg-colorBlue">
                  <td className="border border-black md:w-[5%]">No</td>
                  <td className="border border-black md:w-[25%]">Nama</td>
                  <td className="border border-black md:w-[25%]">Jumlah</td>
                  <td className="border border-black md:w-[30%]">Harga</td>
                  <td className="border border-black md:w-[15%]"></td>
                </tr>
                {datas &&
                  datas.map((item, key) => {
                    number++;
                    return (
                      <tr
                        key={item.suplier_id}
                        className={`${
                          number % 2 === 0 ? "bg-gray-50" : "bg-gray-200"
                        }`}
                      >
                        <td className="border border-black text-center cursor-pointer">
                          {number}
                        </td>
                        <td className="border border-black text-left cursor-pointer px-2 py-1">
                          {item.nama}
                        </td>
                        <td className="border border-black text-left cursor-pointer px-2 py-1">
                          {item.jumlah}
                        </td>
                        <td className="border border-black text-left cursor-pointer px-2 py-1">
                          {RupiahFormat(item.harga)}
                        </td>
                        <td className="border border-black text-center cursor-pointer">
                          <div className="text-center">
                            <i
                              onClick={() => handleEdit(item.id)}
                              className="fa fa-edit mx-2"
                            ></i>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </table>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
      {stModalEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
          <div className="bg-white w-3/4 h-[90%] xl:w-1/2 xl:h-[70%] p-6 rounded-lg shadow-lg relative z-10">
            <div className="w-full h-[10%]">
              <h2 className="text-xl font-semibold mb-2 text-colorBlue font-poppins">
                Ubah Kardus
              </h2>
              <div className="h-[2px] w-full bg-colorBlue mb-4"></div>
            </div>
            <div className="w-full h-[80%] overflow-auto">
              <form onSubmit={handleSubmitEdit}>
                <input type="hidden" value={formData.id} />
                <div className="flex justify-around mt-5 items-center">
                  <p className="w-1/3 md:w-1/4">Jumlah</p>
                  <p>:</p>
                  <input
                    className="border-2 px-1 py-1 w-1/3 md:w-1/2"
                    name="jumlah"
                    value={formData.jumlah}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex justify-around mt-5 items-center">
                  <p className="w-1/3 md:w-1/4">Harga</p>
                  <p>:</p>
                  <input
                    className="border-2 px-1 py-1 w-1/3 md:w-1/2"
                    name="harga"
                    value={formData.harga}
                    onChange={handleChange}
                  />
                </div>
                <button
                  class="mt-5 py-1 px-2 bg-green-700 font-poppins text-colorGray rounded hover:bg-green-900"
                  type="submit"
                >
                  <i class="fa fa-save"></i> Simpan
                </button>
              </form>
            </div>
            <div className="w-full h-[10%]">
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-colorGray border-2 border-colorBlue font-poppins text-colorBlue rounded hover:bg-slate-200"
                  onClick={() => handleModalEdit()}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TambahKardus;
