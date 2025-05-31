// index.js
import express from 'express';
import { configDotenv } from 'dotenv';
import driver from './Database/dbconnection.js'; // ← dùng đúng tên export
import router from './Router/router.js';
import cors from 'cors';

configDotenv({ path: "./config/config.env" });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Cấu hình CORS: thêm domain frontend đã deploy
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://bookstoreudpt.vercel.app"  // ← thêm domain Vercel
    ],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true
}));

// DÙNG router
app.use('/', router);

// Route xác nhận server hoạt động
app.get('/', (req, res) => {
    res.status(200).json({ message: "BookStore backend is running!" });
});

// ✅ Di chuyển xuống dưới cùng
const port = process.env.PORT || 8881;
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});
