import React, { useState } from "react";
// import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { setToken } from "../utilities/Auth";
import { swalError } from "../utilities/Swal";

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
    // const endPoint = "http://127.0.0.1:8000/api/login-api";
    const endPoint = "/api/login-api";
    // login
    try {
      const response = await fetch(endPoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const data = await response.json();
        // Simpan token JWT
        setToken(data.token);
        // Redirect ke dashboard
        navigate("/dashboard");
      } else {
        swalError("Login gagal!", "Username atau password salah");
      }
    } catch (error) {
      swalError("Terjadi error", error.message);
    }
  };

  return (
    <div className="bg-white w-full overflow-hidden flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-8">
          <svg
            className="w-8 h-8 text-blue-900"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
          </svg>
          <span className="text-2xl font-bold text-blue-900 tracking-tight">
            RiceStock
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-500 mb-8">
          Silakan masuk ke sistem manajemen gudang.
        </p>

        <button className="w-full border border-gray-300 rounded-lg py-3 px-4 flex items-center justify-center gap-3 hover:bg-gray-50 transition duration-200 mb-6">
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            className="w-5 h-5"
            alt="Google"
          />
          <span className="text-gray-700 font-medium">Log in with Google</span>
        </button>

        <div className="relative flex items-center mb-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-widest">
            Or Login with Email
          </span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form action="#" className="space-y-4" onSubmit={handleLogin}>
          <div>
            <input
              type="text"
              placeholder="Username"
              onChange={(e) => setUsermail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition duration-200"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition duration-200"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-600">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
              />
              Keep me logged in
            </label>
            <a href="#" className="text-blue-600 hover:underline font-medium">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0a0a3c] text-white font-semibold py-3 rounded-lg hover:bg-blue-900 transition duration-300 flex items-center justify-center gap-2 group"
          >
            Log in
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <a href="#" className="text-blue-600 font-bold hover:underline">
            Sign up
          </a>
        </p>
      </div>

      <div className="hidden md:block md:w-1/2 relative bg-blue-50 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=2070&auto=format&fit=crop"
          alt="Warehouse"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />

        <div className="relative z-10 p-12 h-full flex flex-col justify-between">
          <div className="text-right">
            <h3 className="text-xl font-bold text-blue-900">
              Update Stok Real-time
            </h3>
            <p className="text-blue-700 text-sm mt-2">
              Pantau keluar masuk beras jadi lebih mudah dengan fitur barcode
              scanner terbaru.
            </p>
            <button className="mt-4 px-6 py-2 border-2 border-blue-900 text-blue-900 font-bold rounded-lg hover:bg-blue-900 hover:text-white transition">
              LEARN MORE
            </button>
          </div>

          <div className="mt-auto relative">
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    Laporan Hari Ini
                  </p>
                  <p className="text-xs text-gray-500">
                    2,450 Karung Beras Masuk
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>
    </div>
  );
}

export default Login;
