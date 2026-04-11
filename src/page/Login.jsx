import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { setToken } from "../utilities/Auth";
import putraCabe from "../assets/img/putraCabe.png";
function Login() {
  localStorage.setItem("page", "login");
  const [usermail, setUsermail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Data yang akan dikirim
    const data = {
      username: usermail,
      password: password,
    };
    const endPoint = "http://127.0.0.1:8000/api/login-api";
    // login
    try {
      const response = await fetch(endPoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), // Mengonversi objek menjadi string JSON
      });
      if (response.ok) {
        const data = await response.json();
        // Simpan token JWT
        setToken(data.token);
        // Redirect ke dashboard
        navigate("/dashboard");
      } else {
        alert("Login gagal!");
      }
    } catch (error) {
      alert("Terjadi error: " + error.message);
    }
  };

  return (
    <div className="grid md:grid-cols-2">
      <div className="hidden bg-colorBlue md:block">
        <div className="h-screen flex items-center justify-center">
          <div>
            <img
              src="/putraCabe.png"
              alt="putraCabe"
              className="w-56 mx-auto"
            />
            <h4 className="text-colorGray font-poppins text-4xl font-semibold text-center">
              Putra Cabe
            </h4>
            <h4 className="text-colorGray font-poppins text-3xl font-normal text-center">
              Pembelian & Pengiriman Barang
            </h4>
          </div>
        </div>
      </div>
      <div className="h-screen bg-colorGray flex items-center justify-center">
        <form className="" onSubmit={handleLogin}>
          <h4 className="font-poppins text-4xl font-semibold text-colorBlue text-center">
            Login
          </h4>
          <div className="mt-16">
            <input
              type="text"
              placeholder="Username"
              onChange={(e) => setUsermail(e.target.value)}
              className="w-80 outline-none font-poppins font-normal border-b-2 border-colorBlue bg-transparent py-2 text-colorBlue"
            />
          </div>
          <div className="relative mt-12 mb-2">
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-80 outline-none font-poppins font-normal border-b-2 border-colorBlue bg-transparent py-2 text-colorBlue"
            />
            <i className="absolute right-0 bottom-2 fa fa-eye"></i>
          </div>
          <Link
            to="/login"
            className="font-poppins text-sm italic text-colorBlue"
          >
            Lupa password ?
          </Link>
          <div className="flex gap-4 justify-center mt-12">
            <button
              type="submit"
              className="block bg-colorBlue font-poppins text-colorGray font-semibold py-1 px-3 rounded-[5px] hover:bg-blue-950"
            >
              Login
            </button>
            {/* <Link className="block border-2 border-colorBlue bg-colorGray font-poppins text-colorBlue font-semibold py-1 px-3 rounded-[5px] hover:bg-gray-200">
              Sign In
            </Link> */}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
