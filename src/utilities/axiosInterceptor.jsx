import axios from "axios";

// Instance Axios
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Ganti dengan URL backend Anda
  // baseURL: "/api", // Untuk proxy di development
});

// Interceptor untuk menangani error
api.interceptors.response.use(
  (response) => response, // Jika berhasil, lanjutkan
  (error) => {
    if (error.response && error.response.status === 401) {
      // console.log(error);
      localStorage.removeItem("token"); // Hapus token
      window.location.href = "/login/login"; // Redirect ke login
    }
    // Jangan tampilkan stack trace di konsol
    return Promise.reject(error);
  },
);

export default api;
