import React, { useEffect, useState } from "react";
import RupiahFormat from "../utilities/RupiahFormat";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utilities/axiosInterceptor";
import ModalAdd from "../components/Suplier/ModalAdd";
import ModalEdit from "../components/Suplier/ModalEdit";

function Suplier() {
  const [datas, setDatas] = useState([]);
  const [blur, setBlur] = useState(true);
  const [modalAdd, setModalAdd] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [idEdit, setIdEdit] = useState(false);

  const fectData = async () => {
    const token = localStorage.getItem("token");
    const response = await api.get("get-suplier", {
      headers: {
        Authorization: `Bearer ${token}`, // Sisipkan token di header
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    //
    if (response.status === 200) {
      setBlur(false);
    }
    //get response data
    const data = await response.data.dataSuplier;
    // console.log(data);
    setDatas(data);
  };
  //useEffect hook
  useEffect(() => {
    fectData();
  }, []);
  let number = 1;

  const reloadPage = () => {
    fectData();
  };

  const handleAdd = () => {
    // console.log("tambah");
    setModalAdd(!modalAdd);
  };

  const handleDelete = (id) => {
    console.log(id);
  };
  const handleEdit = (id) => {
    setIdEdit(id);
    setModalEdit(!modalEdit);
  };
  //
  return (
    <div className="p-1 md:p-3 xl:p-5">
      <div className=" w-full h-full mx-auto bg-gray-50 shadow-xl p-4 md:p-8">
        <div className="h-[17%] md:h-[10%] xl:flex items-center mb-5 justify-end">
          <button
            onClick={() => {
              handleAdd();
            }}
            className="cursor-pointer font-poppins text-xs font-semibold text-colorGray px-2 py-1 md:px-4 md:py-2 bg-colorBlue rounded-sm w-fit flex gap-2 md:text-sm items-center"
          >
            <i className="fa fa-plus"></i>
            Tambah
          </button>
        </div>
        <div className="max-h-[83%] md:max-h[80%] overflow-x-scroll">
          <table
            className={`border font-poppins bg-colorBlue text-gray-700 text-xs md:text-sm w-[120%] xl:w-full ${
              blur ? "blur-sm" : "blur-none"
            }`}
          >
            <thead>
              <tr className="text-center h-14 text-white" key="head-pembelian">
                <td className="border border-black">No</td>
                <td className="border border-black">Nama Suplier</td>
                <td className="border border-black">Alamat </td>
                <td className="border border-black">Nomor Hp</td>
                <td className="border border-black">Aksi</td>
              </tr>
            </thead>
            <tbody>
              {datas &&
                datas.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{number++}</td>
                      <td>{item.suplier_nama}</td>
                      <td>{item.alamat}</td>
                      <td>{item.no_hp}</td>
                      <td>
                        <button onClick={() => handleDelete(item.id)}>
                          <i className="fa fa-trash"></i>{" "}
                        </button>
                        <button onClick={() => handleEdit(item.id)}>
                          <i className="fa fa-pen"></i>{" "}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer />
      {modalAdd && (
        <ModalAdd isOpen={modalAdd} onClose={handleAdd} reload={reloadPage} />
      )}
      {modalEdit && (
        <ModalEdit
          id={idEdit}
          isOpen={modalEdit}
          onClose={handleEdit}
          reload={reloadPage}
        />
      )}
    </div>
  );
}

export default Suplier;
