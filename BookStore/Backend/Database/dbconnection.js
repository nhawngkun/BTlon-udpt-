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

export default driver;
