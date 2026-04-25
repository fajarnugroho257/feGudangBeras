import React, { useEffect, useState } from "react";
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

  return (
    <div className="p-1 md:p-3 xl:p-5 font-poppins">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 w-full h-full mx-auto">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Data Master Suplier</h2>
            <p className="text-sm text-gray-500 mt-1">Kelola daftar kontak dan alamat suplier</p>
          </div>
          
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm w-full md:w-auto justify-center"
          >
            <i className="fa fa-plus text-xs"></i>
            Tambah Suplier
          </button>
        </div>

        {/* ========================================= */}
        {/* VIEW MOBILE: CARD LAYOUT (Tampil < 768px)  */}
        {/* ========================================= */}
        <div className={`md:hidden space-y-3 mb-6 ${blur ? "opacity-50" : "opacity-100"} transition-opacity`}>
          {datas && datas.length > 0 ? (
            datas.map((item, index) => (
              <div key={item.id || index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <h3 className="font-bold text-gray-800 text-sm uppercase mb-2">{item.suplier_nama}</h3>
                    <div className="flex items-start gap-2 text-xs text-gray-600 mb-1">
                      <i className="fa fa-map-marker-alt text-gray-400 mt-0.5 w-3 text-center shrink-0"></i>
                      <span className="leading-tight">{item.alamat || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <i className="fa fa-phone text-gray-400 w-3 text-center shrink-0"></i>
                      <span>{item.no_hp || "-"}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 shrink-0 border-l border-gray-100 pl-3">
                    <button 
                      onClick={() => handleEdit(item.id)}
                      className="w-8 h-8 flex justify-center items-center rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
                      title="Edit"
                    >
                      <i className="fa fa-pen text-xs"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 flex justify-center items-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      title="Hapus"
                    >
                      <i className="fa fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-gray-100 text-sm">
              Data suplier tidak ditemukan
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
                <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-64">Nama Suplier</th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Alamat</th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-r border-gray-200 w-40">Nomor HP</th>
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
                        {item.suplier_nama}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 border-r border-gray-100">
                        {item.alamat || "-"}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600 border-r border-gray-100">
                        {item.no_hp || "-"}
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
                  <td colSpan="5" className="text-center py-10 text-gray-500 italic bg-gray-50 rounded-lg">
                    Data suplier tidak ditemukan
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

export default Suplier;