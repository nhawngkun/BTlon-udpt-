import neo4j from 'neo4j-driver';
import { configDotenv } from 'dotenv';

// Sửa lại đường dẫn cho đúng (chạy từ Backend)
configDotenv({ path: './Config/config.env' });

console.log("Loaded URI:", process.env.NEO4J_URI); // test xem có load đúng không

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

export default driver;
//