import food from '../assets/img/nasi-goreng.jpg'

function Menu({ title, price, idMenu, handleAddMenuAction }) {
    // 
    const handleChildAddMenu = (id) => {
        handleAddMenuAction(id);
    }
    return (
        <div>
            <div className="bg-colorGray rounded-tl-xl rounded-tr-xl overflow-hidden">
                <img src={food} alt="quick" className='w-full h-[150px]'/>
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="">
                        <p className="text-colorBlue font-poppins font-semibold text-xs">{title}</p>
                        <p className="text-colorRed font-poppins font-semibold text-xs">{price}</p>  
                    </div>
                    <div className="bg-colorBlue rounded-md cursor-pointer">
                        <i onClick={() => handleChildAddMenu(idMenu)} className="fa fa-plus text-colorGray p-2"></i>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Menu;
