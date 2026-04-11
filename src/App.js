import Login from "./page/Login";
import Penjualan from "./page/Penjualan";
import Pembayaran from "./page/Pembayaran";
import Dashboard from "./page/Dashboard";
import Splash from "./Splash";
import Pembelian from "./page/Pembelian";
import { Route, Routes } from "react-router-dom";
import AuthRoute from "./utilities/AuthRoute";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Pengiriman from "./page/Pengiriman";
import Laporan from "./page/Laporan";
import { useLocation } from "react-router-dom";
import TambahPengiriman from "./page/TambahPengiriman";
import TambahPembelian from "./page/TambahPembelian";
import TambahKaryawan from "./page/TambahKaryawan";
import TambahKardus from "./page/TambahKardus";
import Nota from "./page/Nota";

function App() {
  const location = useLocation();
  const uri = location.pathname;
  return (
    <>
      <div className="h-full">
        <div className={`${uri === "/login" || uri === "/" ? "hidden" : ""}`}>
          <Header pageName="Pembelian" />
        </div>

        <main
          className={`overflow-y-auto h-screen ${
            uri === "/login" || uri === "/" ? "" : " p-3 md:p-5 xl:p-10"
          }`}
        >
          <Routes>
            <Route
              path="/login"
              element={<AuthRoute element={<Login />} isPrivate={false} />}
            />
            <Route
              path="/"
              element={<AuthRoute element={<Splash />} isPrivate={false} />}
            />
            {/* route yang di authentikasi */}
            <Route
              path="/penjualan"
              element={<AuthRoute element={<Penjualan />} isPrivate={true} />}
            />
            <Route
              path="/pembayaran"
              element={<AuthRoute element={<Pembayaran />} isPrivate={true} />}
            />

            <Route
              path="/dashboard"
              element={<AuthRoute element={<Dashboard />} isPrivate={true} />}
            />
            <Route
              path="/pembelian"
              element={<AuthRoute element={<Pembelian />} isPrivate={true} />}
            />
            <Route
              path="/pengiriman"
              element={<AuthRoute element={<Pengiriman />} isPrivate={true} />}
            />
            <Route
              path="/laporan"
              element={<AuthRoute element={<Laporan />} isPrivate={true} />}
            />
            <Route
              path="/tambah-pengiriman"
              element={
                <AuthRoute element={<TambahPengiriman />} isPrivate={true} />
              }
            />
            <Route
              path="/tambah-pembelian"
              element={
                <AuthRoute element={<TambahPembelian />} isPrivate={true} />
              }
            />
            <Route
              path="/tambah-karyawan"
              element={
                <AuthRoute element={<TambahKaryawan />} isPrivate={true} />
              }
            />
            <Route
              path="/tambah-kardus"
              element={
                <AuthRoute element={<TambahKardus />} isPrivate={true} />
              }
            />
            <Route
              path="/nota"
              element={<AuthRoute element={<Nota />} isPrivate={true} />}
            />
          </Routes>
        </main>
      </div>
      <div className={`${uri === "/login" || uri === "/" ? "hidden" : ""}`}>
        <footer className="bg-colorBlue w-full flex items-center font-poppins text-white py-3 justify-end px-5">
          <p>Putra Cabe v.1</p>
        </footer>
      </div>
    </>
  );
}

export default App;
