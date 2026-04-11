import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Logout from "../utilities/Logount";

function User() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref untuk komponen dropdown

  const toggleUser = () => {
    setIsOpen(!isOpen);
  };

  // Tutup dropdown jika klik di luar elemen dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false); // Tutup dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div>
      <div className="relative" ref={dropdownRef}>
        <i onClick={toggleUser} className="fa fa-user cursor-pointer"></i>
        <div
          className={`absolute transition-transform transform ${
            isOpen ? "block" : "hidden"
          } bg-white border border-colorBlue text-colorBlue font-poppins w-36 rounded-md -right-4`}
        >
          <div className="px-3 py-4 text-sm">
            {/* <Link to="/login" className="pb-2 w-fit block">
              Profil
            </Link>
            <Link to="/login" className=" w-fit block">
              Profil
            </Link> */}
            <Logout />
          </div>
        </div>
      </div>
    </div>
  );
}

export default User;
