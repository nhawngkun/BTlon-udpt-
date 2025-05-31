import { v4 as uuidv4 } from 'uuid'
import driver from '../Database/dbconnection.js'

const addBook = async (req, res) => {
    const session = driver.session()
    const transaction = session.beginTransaction(); // Sử dụng transaction để đảm bảo tính toàn vẹn
    
    try {
        console.log("Attempting to add new book to Neo4j...");
        const id = uuidv4()
        const { name, lang, category, image, title, link, content, description } = req.body
        const author = req.body.author || 'Unknown Author'  // Đảm bảo luôn có tác giả
        const categoryName = category || 'General'  // Đảm bảo luôn có thể loại
        
        console.log(`Book details: ID=${id}, Name=${name}, Author=${author}, Category=${categoryName}`);

        // 1. Tạo node Book
        console.log("Creating Book node...");
        const bookResult = await transaction.run(
            `CREATE (b:Book {
                id: $id, 
                name: $name, 
                lang: $lang, 
                category: $categoryName,
                image: $image, 
                title: $title, 
                link: $link,
                content: $content, 
                description: $description, 
                author: $author
            }) RETURN b`,
            { id, name, lang, categoryName, image, title, link, content, description, author }
        );
        console.log("Book node created successfully");

        // 2. Tạo hoặc tìm node Author
        console.log("Creating/finding Author node...");
        await transaction.run(
            `MERGE (a:Author {name: $author}) 
             RETURN a`,
            { author }
        );

        // 3. Tạo hoặc tìm node Category
        console.log("Creating/finding Category node...");
        await transaction.run(
            `MERGE (c:Category {name: $categoryName}) 
             RETURN c`,
            { categoryName }
        );

        // 4. Tạo quan hệ WRITTEN_BY giữa Book và Author
        console.log("Creating relationship between Book and Author...");
        await transaction.run(
            `MATCH (b:Book {id: $id})
             MATCH (a:Author {name: $author})
             MERGE (b)-[:WRITTEN_BY]->(a)`,
            { id, author }
        );

        // 5. Tạo quan hệ BELONGS_TO giữa Book và Category
        console.log("Creating relationship between Book and Category...");
        await transaction.run(
            `MATCH (b:Book {id: $id})
             MATCH (c:Category {name: $categoryName})
             MERGE (b)-[:BELONGS_TO]->(c)`,
            { id, categoryName }
        );

        // Commit transaction nếu mọi thứ hoàn thành tốt
        await transaction.commit();
        
        const book = bookResult.records[0].get('b').properties
        console.log("Book added successfully with complete relationships");
        res.status(200).json({ 
            success: true,
            message: "Book added successfully with author and category relationships", 
            data: book 
        })
    } catch (error) {
        // Rollback transaction nếu có lỗi
        await transaction.rollback();
        
        console.error("Error adding book to Neo4j:", error);
        res.status(500).json({ 
            success: false,
            message: `Error adding book to Neo4j: ${error.message}` 
        })
    } finally {
        await session.close()
    }
}

// Đã đảm bảo: khi thêm sách sẽ tự động nối với tác giả và thể loại (Author, Category) và tạo quan hệ
export default addBook