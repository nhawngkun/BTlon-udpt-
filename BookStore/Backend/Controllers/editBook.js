import driver from '../Database/dbconnection.js'

const editBook = async (req, res) => {
    const session = driver.session()
    const transaction = session.beginTransaction();
    
    try {
        const { id } = req.params
        const { name, lang, category, image, title, link, content, description, author } = req.body
        
        const actualAuthor = author || 'Unknown Author'
        const actualCategory = category || 'General'
        
        console.log(`Editing book ID=${id}, Author=${actualAuthor}, Category=${actualCategory}`);

        // 1. Cập nhật thông tin sách
        await transaction.run(
            `MATCH (b:Book {id: $id})
            SET b.name = $name, 
                b.lang = $lang, 
                b.category = $actualCategory,
                b.image = $image, 
                b.title = $title, 
                b.link = $link,
                b.content = $content, 
                b.description = $description,
                b.author = $actualAuthor
            RETURN b`,
            { id, name, lang, actualCategory, image, title, link, content, description, actualAuthor }
        )
        
        // 2. Xóa quan hệ cũ
        await transaction.run(
            `MATCH (b:Book {id: $id})-[r:WRITTEN_BY|BELONGS_TO]->()
             DELETE r`,
            { id }
        )
        
        // 3. Cập nhật/tạo Author node nếu cần
        await transaction.run(
            `MERGE (a:Author {name: $actualAuthor})
             RETURN a`,
            { actualAuthor }
        )
        
        // 4. Cập nhật/tạo Category node nếu cần
        await transaction.run(
            `MERGE (c:Category {name: $actualCategory})
             RETURN c`,
            { actualCategory }
        )
        
        // 5. Tạo quan hệ mới giữa Book và Author
        await transaction.run(
            `MATCH (b:Book {id: $id})
             MATCH (a:Author {name: $actualAuthor})
             MERGE (b)-[:WRITTEN_BY]->(a)`,
            { id, actualAuthor }
        )
        
        // 6. Tạo quan hệ mới giữa Book và Category  
        await transaction.run(
            `MATCH (b:Book {id: $id})
             MATCH (c:Category {name: $actualCategory})
             MERGE (b)-[:BELONGS_TO]->(c)`,
            { id, actualCategory }
        )

        // Commit transaction
        await transaction.commit();

        res.status(200).json({ 
            success: true,
            message: "Book and relationships updated successfully" 
        })
    } catch (error) {
        // Rollback transaction nếu có lỗi
        await transaction.rollback();
        
        console.error("Error updating book:", error);
        res.status(500).json({ 
            success: false,
            message: `Error updating book: ${error.message}` 
        })
    } finally {
        await session.close()
    }
}

export default editBook
