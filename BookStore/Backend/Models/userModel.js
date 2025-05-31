// ❗ Trong Neo4j bạn không cần mô hình kiểu Mongoose như MongoDB.
// Tuy nhiên, nếu bạn muốn tạo 1 lớp tiện ích cho User để tái sử dụng trong controller, có thể làm như sau:

import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const driver = neo4j.driver(
    'neo4j+s://58270351.databases.neo4j.io',
    neo4j.auth.basic('neo4j', 'UlXPYheImRAqEPXhXehOLc89qRc9AKM6us2x2VJHgkY')
)

const getSession = () => driver.session();

const UserModel = {
    async create({ name, email, password }) {
        const session = getSession();
        const id = Date.now().toString();
        const defaultFields = {
            image: "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg",
            gender: "Male",
            address: "India",
            dob: "01-01-2000",
            phone: "1234567890",
            role: "Book Reader",
            books: "0"
        };

        try {
            const result = await session.run(
                `CREATE (u:User {
          id: $id,
          name: $name,
          email: $email,
          password: $password,
          image: $image,
          gender: $gender,
          address: $address,
          dob: $dob,
          phone: $phone,
          role: $role,
          books: $books
        }) RETURN u`,
                { id, name, email, password, ...defaultFields }
            );

            return result.records[0]?.get('u').properties;
        } finally {
            await session.close();
        }
    },

    async findByEmail(email) {
        const session = getSession();
        try {
            const result = await session.run(
                'MATCH (u:User {email: $email}) RETURN u',
                { email }
            );
            return result.records[0]?.get('u').properties;
        } finally {
            await session.close();
        }
    },

    async findById(id) {
        const session = getSession();
        try {
            const result = await session.run(
                'MATCH (u:User {id: $id}) RETURN u',
                { id }
            );
            return result.records[0]?.get('u').properties;
        } finally {
            await session.close();
        }
    },

    async update(id, updates) {
        const session = getSession();
        const setClauses = Object.keys(updates)
            .map(key => `u.${key} = $${key}`)
            .join(', ');

        try {
            const result = await session.run(
                `MATCH (u:User {id: $id}) SET ${setClauses} RETURN u`,
                { id, ...updates }
            );
            return result.records[0]?.get('u').properties;
        } finally {
            await session.close();
        }
    },

    async delete(id) {
        const session = getSession();
        try {
            await session.run(
                'MATCH (u:User {id: $id}) DETACH DELETE u',
                { id }
            );
            return true;
        } finally {
            await session.close();
        }
    }
};

export default UserModel;