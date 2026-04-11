import React, { useState } from "react";

function ModalPembayaran({ isOpen, onClose }) {

    const [number, setNumber] = useState([]);
    const [tagihan, setTagihan] = useState(59000);
    const [kembalian, setKembalian] = useState(0);

    const result = number.join('');

    const handleNumber = (value) => {
        if (value === 'c') {
            setNumber([]);
            setKembalian(0);
        } else {
            // console.log(number.length);
            if (value !== 'x') {
                if (number.length < 1 && value === 0) {

                } else {
                    var dataInput = [...number, value];
                    setNumber(dataInput);
                    setKembalian(dataInput.join('') - tagihan);
                }
            }
        }
        
    }

    const deleteItem = () => {
        var dataInput = number.filter((item, i) => i !== (number.length - 1));
        setNumber(dataInput);
        setKembalian(dataInput.join('') - tagihan);
    };
    // 
    

    // Fungsi untuk memformat angka menjadi format Rupiah
    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    // console.log(formatRupiah(result));
    const hitung = ()=>{
        console.log(result);
    }
    
    // perhitungan

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
            <div className="bg-white w-1/2 h-3/4 p-6 rounded-lg shadow-lg relative z-10">
                <h2 className="text-xl font-bold mb-4 text-colorBlue font-poppins">Pembayaran</h2>
                <div className="h-[2px] w-full bg-colorBlue mb-4"></div>
                <div className="flex">
                    <div className="w-1/2">
                    <div className="font-poppins text-xl flex justify-between font-semibold my-2">
                            <h3 className="text-colorBlue">PEMBAYARAN</h3>
                            <h3 className="text-colorBlue">{formatRupiah(result)}</h3>
                        </div>
                        <div className="font-poppins text-xl flex justify-between font-semibold">
                            <h3 className="text-colorBlue">TAGIHAN</h3>
                            <h3 className="text-colorRed">{formatRupiah(tagihan)}</h3>
                        </div>
                        <div className="h-[2px] w-full bg-colorBlue my-2"></div>
                        <div className="font-poppins text-xl flex justify-between font-semibold">
                            <h3 className="text-colorBlue">KEMBALIAN</h3>
                            <h3 className="text-colorBlue">{formatRupiah(kembalian)}</h3>
                        </div>
                    </div>
                    <div className="w-1/2">
                        <div className="bg-colorGray w-3/4 ml-auto">
                            <div className="h-20 flex items-center">
                                <div className="bg-white mx-4 w-full py-5 px-2 text-right font-poppins font-bold text-colorBlue text-xl">{formatRupiah(result) || 0}</div>
                            </div>
                            <div className="grid grid-cols-3 font-poppins font-bold text-colorBlue text-xl">
                                <div onClick={() => handleNumber(1)} className="w-14 h-14 bg-white m-2 flex items-center justify-center cursor-pointer mx-auto">1</div>
                                <div onClick={() => handleNumber(2)} className="w-14 h-14 bg-white m-2 flex items-center justify-center cursor-pointer mx-auto">2</div>
                                <div onClick={() => handleNumber(3)} className="w-14 h-14 bg-white m-2 flex items-center justify-center cursor-pointer mx-auto">3</div>
                                <div onClick={() => handleNumber(4)} className="w-14 h-14 bg-white m-2 flex items-center justify-center cursor-pointer mx-auto">4</div>
                                <div onClick={() => handleNumber(5)} className="w-14 h-14 bg-white m-2 flex items-center justify-center cursor-pointer mx-auto">5</div>
                                <div onClick={() => handleNumber(6)} className="w-14 h-14 bg-white m-2 flex items-center justify-center cursor-pointer mx-auto">6</div>
                                <div onClick={() => handleNumber(7)} className="w-14 h-14 bg-white m-2 flex items-center justify-center cursor-pointer mx-auto">7</div>
                                <div onClick={() => handleNumber(8)} className="w-14 h-14 bg-white m-2 flex items-center justify-center cursor-pointer mx-auto">8</div>
                                <div onClick={() => handleNumber(9)} className="w-14 h-14 bg-white m-2 flex items-center justify-center cursor-pointer mx-auto">9</div>
                                <div onClick={() => handleNumber("c")} className="w-14 h-14 bg-white m-2 flex items-center justify-center cursor-pointer mx-auto">C</div>
                                <div onClick={() => handleNumber(0)} className="w-14 h-14 bg-white m-2 flex items-center justify-center cursor-pointer mx-auto">0</div>
                                <div onClick={() => deleteItem()} className="w-14 h-14 bg-white m-2 flex items-center justify-center cursor-pointer mx-auto">X</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* <input type="text" name="customer" className={`border-2 border-colorBlue block mb-4 py-1 w-full px-2`} placeholder="" /> */}
                <div className="flex justify-between">
                    <button className="px-4 py-2 bg-colorGray border-2 border-colorBlue font-poppins text-colorBlue rounded hover:bg-slate-200" onClick={onClose}>Close</button>
                    <button type="submit" className="px-4 py-2 bg-colorBlue font-poppins text-colorGray rounded hover:bg-blue-900">Selanjutnya</button>
                </div>
            </div>
        </div>
    );
}

export default ModalPembayaran;