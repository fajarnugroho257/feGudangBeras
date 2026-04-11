function DraftPembayaran() {
    return (
        <div className="pb-1 pr-2 cursor-pointer">
            <div className="bg-colorGray p-4 font-poppins border border-colorBlue">
                <div className="flex justify-between">
                    <h3 className="text-colorBlue font-semibold">Bagas</h3>
                    <div className="flex items-center text-sm font-normal">
                        <i className="text-colorBlue fa fa-clock mr-1"></i>
                        <p>14:14:17</p>
                        <div className="w-[2px] h-1/2 mx-2 bg-colorBlue"></div>
                        <p>ID : 1628162</p>
                    </div>
                </div>
                <div className="w-full h-[1px] my-1 bg-colorBlue"></div>
                <p className="text-colorBlue">Food : Nasi Goreng Ayam</p>
                <p className="text-colorBlue">Drink : Kopi Gula Aren, Jus Apukat</p>
            </div>                                
        </div>
    );
}

export default DraftPembayaran;