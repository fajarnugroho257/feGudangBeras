import React, { useState } from 'react';

function Dropdown({ title, items }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div>
            <div className="text-colorGray flex justify-between items-center  p-1 my-2" >
                <p onClick={toggleDropdown} className='cursor-pointer'>{title}</p>
                <i onClick={toggleDropdown} className={`${isOpen ? 'fa fa-angle-down' : 'fa fa-angle-left'} cursor-pointer`}></i>
            </div>
            {/* Dropdown menu */}
            {isOpen && (
                <div className="">
                    <div className="py-1 bg-colorGray " role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {items.map((item, index) => (
                            <a
                                href="/"
                                key={index}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-300 "
                                role="menuitem"
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dropdown;
