import neo4j from 'neo4j-driver';
import { configDotenv } from 'dotenv';

// ✅ Load file config.env
configDotenv({ path: '../Config/config.env' }); // đúng path

// ✅ Thêm log tại đây
console.log("Loaded URI:", process.env.NEO4J_URI); // test xem có load đúng không

// Tạo kết nối driver
const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

// Nếu có đoạn hardcode password thì sửa lại như sau (nếu không có thì bỏ qua):
// neo4j.auth.basic('neo4j', 'UlXPYheImRAqEPXhXehOLc89qRc9AKM6us2x2VJHgkY')

export default driver;
