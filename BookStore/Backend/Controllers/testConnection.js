// testConnection.js
import { config } from 'dotenv';
import neo4j from 'neo4j-driver';

// Đường dẫn từ Controllers đến Config
config({ path: '../Config/config.env' });

const URI = process.env.NEO4J_URI;
const USER = process.env.NEO4J_USERNAME;
const PASSWORD = process.env.NEO4J_PASSWORD;

async function testConnection() {
  const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
  try {
    const serverInfo = await driver.getServerInfo();
    console.log('Connection established!');
    console.log(serverInfo);
    await driver.close();
  } catch (err) {
    console.log('Connection error:', err);
    console.log('URI:', URI);
    console.log('USER:', USER);
  }
}

testConnection();