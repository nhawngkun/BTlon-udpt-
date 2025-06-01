// Config for backend API URL
const API_URL =
  import.meta.env.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  "https://bookstore-backend-production.up.railway.app" || // Thay bằng domain backend thật nếu có
  "http://localhost:5000";

export default API_URL;