import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";

function Modal({ isOpen, onClose }) {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        customer: ''
    });

    const [errors, setErrors] = useState({
        name: false
    });

    const handleInputChange = (e) => {
        // console.log(e.target.value);
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    
        // Validasi input form
        const newErrors = {
            customer: formData.customer === '',
        };
    
        setErrors(newErrors);
    
        if (!newErrors.customer) {
          // Jika tidak ada error, proses form
          console.log(formData);
          navigate("/pembayaran");

        }

    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
            <div className="bg-white p-6 rounded-lg shadow-lg relative z-10">
                <h2 className="text-xl font-bold mb-4 text-colorBlue font-poppins">Masukkan Nama Customer</h2>
                <input type="text" onChange={handleInputChange} name="customer" value={formData.customer} className={`border-2 ${errors.customer ? 'border-red-500' : 'border-colorBlue'} block mb-4 py-1 w-full px-2`} placeholder="" />
                <div className="flex justify-between">
                    <button className="px-4 py-2 bg-colorGray border-2 border-colorBlue font-poppins text-colorBlue rounded hover:bg-slate-200" onClick={onClose}>Close</button>
                    <button type="submit" className="px-4 py-2 bg-colorBlue font-poppins text-colorGray rounded hover:bg-blue-900" onClick={handleSubmit}>Selanjutnya</button>
                </div>

            </div>
        </div>
    );
}

export default Modal;