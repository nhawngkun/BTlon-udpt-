import { v4 as uuidv4 } from 'uuid'
import driver from '../Database/dbconnection.js'

const addBook = async (req, res) => {
    const session = driver.session()
    try {
        console.log("Attempting to add new book to Neo4j...");
        const id = uuidv4()
        const { name, lang, category, image, title, link, content, description } = req.body
        const author = req.body.author || 'Tác giả A'  // Đảm bảo luôn có author
        
        console.log(`Book details: ID=${id}, Name=${name}, Author=${author}, Category=${category}`);

        // Tạo node Book
        console.log("Creating Book node...");
        const bookResult = await session.run(
            `CREATE (b:Book {
                id: $id, name: $name, lang: $lang, category: $category,
                image: $image, title: $title, link: $link,
                content: $content, description: $description, author: $author
            }) RETURN b`,
            { id, name, lang, category, image, title, link, content, description, author }
        );
        console.log("Book node created successfully");

        // Tạo hoặc tìm node Author và quan hệ
        console.log("Creating/finding Author node and relationship...");
        await session.run(
            `MATCH (b:Book {id: $id})
             MERGE (a:Author {name: $author})
             MERGE (b)-[:WRITTEN_BY]->(a)`,
            { id, author }
        );
        console.log("Author relationship created");

        // Tạo hoặc tìm node Category và quan hệ
        console.log("Creating/finding Category node and relationship...");
        await session.run(
            `MATCH (b:Book {id: $id})
             MERGE (c:Category {name: $category})
             MERGE (b)-[:BELONGS_TO]->(c)`,
            { id, category }
        );
        console.log("Category relationship created");

        const book = bookResult.records[0].get('b').properties
        console.log("Book added successfully with complete relationships");
        res.status(200).json({ message: "Book added successfully", data: book })
    } catch (error) {
        console.error("Error adding book to Neo4j:", error);
        res.status(500).json({ message: error.message })
    } finally {
        await session.close()
    }
}

export default addBook