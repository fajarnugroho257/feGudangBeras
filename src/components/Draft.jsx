import RupiahFormat from "../utilities/RupiahFormat";
import React, { useEffect, useState, useRef } from "react";

function Draft({ id, title, price, handleDeleteMenuAction, hitungTotalPembelian }) {

    const [jumlah, setJumlah] = useState(1);
    const [ttlHarga, setTtlHarga] = useState(price);
    const [stCatatan, setStCatatan] = useState(false);
    const [valueCatatan, setValueCatatan] = useState('');
    // 
    const catatanRef = useRef(null); // Ref untuk komponen dropdown
    
    useEffect(() => {
        const loadTotalHarga = () => {
            let dataTtlHarga = 
                {'id': id, 'ttlharga': ttlHarga, 'catatan': valueCatatan}
            ;
            hitungTotalPembelian(dataTtlHarga);
        }
        loadTotalHarga();
    }, []);

    // Tutup 
    useEffect(() => {
        const handleClickOutside = (event) => {
        if (catatanRef.current && !catatanRef.current.contains(event.target)) {
                setStCatatan(false); // Tutup 
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [catatanRef]);

    const decrement = () => {
        if (jumlah !== 0) {
            setJumlah(jumlah-1);
            // 
            const resTtlHarga = price * (jumlah-1);
            setTtlHarga(resTtlHarga);
            sendData(resTtlHarga);
        }
    }

    const increment = () => {
        setJumlah(jumlah+1);
        // 
        const resTtlHarga = price * (jumlah+1);
        setTtlHarga(resTtlHarga);
        sendData(resTtlHarga);
    }

    function sendData(resTtlHarga) {
        let dataTtlHarga = {'id': id, 'ttlharga': resTtlHarga, 'catatan': valueCatatan};
        hitungTotalPembelian(dataTtlHarga);
    }

    const handelCatatan = () => {
        if (stCatatan) {
            setStCatatan(false);
        } else {
            setStCatatan(true);
        }
    }

    const handleValueCatatan = (event) => {
        setValueCatatan(event.target.value);
        let dataTtlHarga = {'id': id, 'ttlharga': ttlHarga, 'catatan': event.target.value};
        hitungTotalPembelian(dataTtlHarga);
    }
    // 
    return (
        <div>
            <div className="flex bg-colorGray my-2 items-center px-5">
                <div className="mr-10">
                    <div className="flex w-24 h-10">
                        <div onClick={decrement} className="flex items-center justify-center border-y-2 border-l-2 rounded-tl-lg rounded-bl-lg border-colorBlue h-full w-8 cursor-pointer"><i className="fa fa-minus"></i></div>
                        <div className="flex items-center justify-center h-full w-8 font-poppins font-normal text-lg bg-colorBlue text-colorGray">{jumlah}</div>
                        <div onClick={increment} className="flex items-center justify-center border-y-2 border-r-2 rounded-tr-lg rounded-br-lg border-colorBlue h-full w-8 cursor-pointer"><i className="fa fa-plus"></i></div>
                    </div>
                </div>
                <div className="py-5">
                    <h3 className="text-sm font-poppins text-colorBlue font-semibold md:text-lg">{title}</h3>
                    <h3 className="text-sm font-poppins text-colorRed font-semibold md:text-lg">{RupiahFormat(ttlHarga)}</h3>
                </div>
                <div className="ml-auto gap-2 flex">
                    <div className="relative" ref={catatanRef}>
                        <i onClick={handelCatatan} className="fa fa-sticky-note text-colorBlue cursor-pointer border-2 p-2 border-colorBlue" title="Catatan"></i>
                        <div className={`absolute bg-colorGray border-2 border-colorBlue rounded-md -left-40 -bottom-20 z-50 flex items-center justify-center ${stCatatan ? '' : 'hidden'} `}>
                            {/* <textarea className="border-2 border-colorBlue my-5 mx-3" placeholder="Catatan"/> */}
                            <textarea name="" onChange={handleValueCatatan} className="border-2 border-colorBlue p-1 my-3 mx-2" id="" placeholder="Catatan"></textarea>
                        </div>
                    </div>
                    <i onClick={() => handleDeleteMenuAction(id)} className="fa fa-trash text-colorRed cursor-pointer border-2 p-2 border-colorRed" title="Hapus"></i>
                </div>
            </div>
        </div>
    );
}

export default Draft;