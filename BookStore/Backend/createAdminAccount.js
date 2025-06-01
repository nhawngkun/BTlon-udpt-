import neo4j from 'neo4j-driver';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: "./config/config.env" });

const uri = process.env.NEO4J_URI || 'neo4j+s://58270351.databases.neo4j.io';
const username = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'UlXPYheImRAqEPXhXehOLc89qRc9AKM6us2x2VJHgkY';

console.log("Connecting to Neo4j at:", uri);

const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password)
);

const session = driver.session();

const createAdminUser = async () => {
  try {
    // Xóa admin cũ nếu tồn tại (để reset hoàn toàn)
    console.log("Checking for existing admin account...");
    await session.run('MATCH (u:User {email: "admin@bookstore.com"}) DETACH DELETE u');
    
    // Tạo admin mới
    console.log("Creating new admin account...");
    const id = Date.now().toString();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const result = await session.run(
      `CREATE (u:User {
        id: $id,
        name: "Admin User",
        email: "admin@bookstore.com",
        password: $hashedPassword,
        image: "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg",
        gender: "Not specified",
        address: "BookStore HQ",
        dob: "01-01-2000",
        phone: "0987654321",
        role: "Admin",
        books: "0"
      }) RETURN u`,
      { id, hashedPassword }
    );
    
    if (result.records.length > 0) {
      const userNode = result.records[0].get('u').properties;
      console.log("✅ Admin created successfully!");
      console.log("ID:", userNode.id);
      console.log("Email:", userNode.email);
      console.log("Password: admin123");
      console.log("Role:", userNode.role);
    } else {
      console.log("❌ Failed to create admin user");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await session.close();
    await driver.close();
  }
};

createAdminUser();
