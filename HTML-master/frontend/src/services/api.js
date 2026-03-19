import axios from "axios";

// Ưu tiên lấy từ biến môi trường (Render/Vercel), nếu không có thì dùng link Render bạn đã cung cấp
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://quizzapp-kovj.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- 1. Request Interceptor: Tự động gắn Token ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Lấy token nhận được khi login [cite: 9, 15]
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Gửi kèm Header Authorization [cite: 9]
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- 2. Response Interceptor: Xử lý dữ liệu và Lỗi ---
api.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp dữ liệu để Component dùng luôn (ví dụ: data.message)
    return response.data;
  },
  (error) => {
    // Xử lý mã lỗi HTTP dựa trên tài liệu API [cite: 10, 11, 12, 13]
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // Lỗi Token hết hạn hoặc chưa đăng nhập: Tự động đẩy về trang Login 
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      
      if (status === 403) {
        console.error("Bạn không có quyền thực hiện hành động này."); // [cite: 12]
      }
    }
    return Promise.reject(error);
  }
);

export default api;