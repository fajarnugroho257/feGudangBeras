import React, { useEffect, useState } from "react";
import RupiahFormat from "../utilities/RupiahFormat";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utilities/axiosInterceptor";
import ModalAdd from "../components/Barang/ModalAdd";
import ModalEdit from "../components/Barang/ModalEdit";

function Barang() {
  const [datas, setDatas] = useState([]);
  const [blur, setBlur] = useState(true);
  const [modalAdd, setModalAdd] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [idEdit, setIdEdit] = useState(false);

  const fectData = async () => {
    const token = localStorage.getItem("token");
    const response = await api.get("get-barang", {
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
    const data = await response.data.dataBarang;
    setDatas(data);
  };

  //useEffect hook
  useEffect(() => {
    fectData();
  }, []);

  const reloadPage = () => {
    fectData();
  };

  const handleAdd = () => {
    setModalAdd(!modalAdd);
  };

  const handleDelete = (id) => {
    console.log(id);
  };
  
  const handleEdit = (id) => {
    setIdEdit(id);
    setModalEdit(!modalEdit);
  };

  // Helper fungsi untuk warna badge Tipe
  const getBadgeStyle = (tipe) => {
    if (tipe === "beras") return "bg-red-100 text-red-700 border-red-200";
    if (tipe === "katul") return "bg-gray-100 text-gray-700 border-gray-200";
    if (tipe === "sekam") return "bg-green-100 text-green-700 border-green-200";
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  return (
    <div className="p-1 md:p-3 xl:p-5 font-poppins">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 w-full h-full mx-auto">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Data Master Barang</h2>
            <p className="text-sm text-gray-500 mt-1">Kelola daftar barang dan tipe produk</p>
          </div>
          
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm w-full md:w-auto justify-center"
          >
            <i className="fa fa-plus text-xs"></i>
            Tambah Barang
          </button>
        </div>

        {/* ========================================= */}
        {/* VIEW MOBILE: CARD LAYOUT (Tampil < 768px)  */}
        {/* ========================================= */}
        <div className={`md:hidden space-y-3 mb-6 ${blur ? "opacity-50" : "opacity-100"} transition-opacity`}>
          {datas && datas.length > 0 ? (
            datas.map((item, index) => (
              <div key={item.id || index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm uppercase">{item.nama}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border mt-2 ${getBadgeStyle(item.tipe)}`}>
                    {item.tipe}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(item.id)}
                    className="w-8 h-8 flex justify-center items-center rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
                  >
                    <i className="fa fa-pen text-xs"></i>
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 flex justify-center items-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    <i className="fa fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
            ))
          ) : (
             <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-gray-100 text-sm">
               Data barang tidak ditemukan
             </div>
          )}
        </div>

        {/* ========================================= */}
        {/* VIEW DESKTOP: TABLE LAYOUT (Tampil > 768px) */}
        {/* ========================================= */}
        <div className={`hidden md:block overflow-x-auto rounded-lg border border-gray-200 ${blur ? "opacity-50" : "opacity-100"} transition-opacity`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-16">No</th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Nama Barang</th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-48">Tipe</th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {datas && datas.length > 0 ? (
                datas.map((item, index) => {
                  let rowNumber = index + 1;
                  return (
                    <tr key={item.id || index} className="hover:bg-teal-50/20 transition-colors">
                      <td className="py-3 px-4 text-center text-sm font-medium text-gray-500 border-r border-gray-100">
                        {rowNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 font-bold uppercase border-r border-gray-100">
                        {item.nama}
                      </td>
                      <td className="py-3 px-4 text-center border-r border-gray-100">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(item.tipe)}`}>
                          {item.tipe}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center items-center gap-2">
                          <button 
                            onClick={() => handleEdit(item.id)}
                            className="w-8 h-8 flex justify-center items-center rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
                            title="Edit"
                          >
                            <i className="fa fa-pen text-sm"></i>
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="w-8 h-8 flex justify-center items-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            title="Hapus"
                          >
                            <i className="fa fa-trash text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-500 italic bg-gray-50 rounded-lg">
                    Data barang tidak ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <ToastContainer position="bottom-right" />
      
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

export default Barang;