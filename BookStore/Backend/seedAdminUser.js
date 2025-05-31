import neo4j from 'neo4j-driver';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const driver = neo4j.driver(
  'neo4j+s://58270351.databases.neo4j.io',
  neo4j.auth.basic('neo4j', 'UlXPYheImRAqEPXhXehOLc89qRc9AKM6us2x2VJHgkY')
);

const session = driver.session();

const createAdminUser = async () => {
  try {
    // Xóa admin cũ nếu có (để tạo mới với password đúng)
    await session.run(
      'MATCH (u:User {email: "admin@bookstore.com"}) DETACH DELETE u'
    );
    console.log('Deleted existing admin if any');
    
    // Tạo password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // ID và thời gian tạo
    const id = Date.now().toString();
    
    // Tạo admin user
    const result = await session.run(
      `CREATE (u:User {
        id: $id,
        name: "Admin",
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

    const createdUser = result.records[0].get('u').properties;
    console.log('✅ Admin user created successfully!');
    console.log('Email:', createdUser.email);
    console.log('Password: admin123');
    console.log('Role:', createdUser.role);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await session.close();
    await driver.close();
  }
};

createAdminUser();
