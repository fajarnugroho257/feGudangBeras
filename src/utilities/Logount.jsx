import { useNavigate } from "react-router-dom";
import api from "../utilities/axiosInterceptor";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // TOKEN
    const token = localStorage.getItem("token");
    //
    const response = await api.get("/logout", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    if (response.status === 200) {
      // Hapus token dari local storage (atau session storage)
      localStorage.removeItem("token");

      // Arahkan ke halaman login
      navigate("/login");
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
