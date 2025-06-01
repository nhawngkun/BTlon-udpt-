// Config for backend API URL
const API_URL =
  import.meta.env.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  "https://bookstore-backend-production.up.railway.app" || // URL backend đã deployed
  "http://localhost:8881";

export default API_URL;