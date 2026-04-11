// import React, { useState, useEffect, useRef } from 'react';
// import { Link } from 'react-router-dom';

function Kategori() {
    return(
        <div className='overflow-auto flex gap-2 pt-4 pb-1 w-full'>
            <div className='bg-colorBlue w-fit py-1 px-2 rounded-xl text-colorGray'>
                <p className='font-poppins text-sm'>Semua</p>
            </div>
            <div className='border-2 border-colorBlue w-fit py-1 px-2 rounded-xl text-colorBlue'>
                <p className='font-poppins text-sm'>Food</p>
            </div>
            <div className='border-2 border-colorBlue w-fit py-1 px-2 rounded-xl text-colorBlue'>
                <p className='font-poppins text-sm'>Juice</p>
            </div>
            <div className='border-2 border-colorBlue w-fit py-1 px-2 rounded-xl text-colorBlue'>
                <p className='font-poppins text-sm'>Snack</p>
            </div>
            <div className='border-2 border-colorBlue w-fit py-1 px-2 rounded-xl text-colorBlue'>
                <p className='font-poppins text-sm'>Coffe</p>
            </div>
            <div className='border-2 border-colorBlue w-fit py-1 px-2 rounded-xl text-colorBlue'>
                <p className='font-poppins text-sm'>Bear</p>
            </div>
        </div>
    );
}

export default Kategori;