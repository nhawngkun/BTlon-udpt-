import { v4 as uuidv4 } from 'uuid'
import driver from '../Database/dbconnection.js'

const addBook = async (req, res) => {
    const session = driver.session()
    try {
        const id = uuidv4()
        const { name, lang, category, image, title, link, content, description, author } = req.body

        // 1. Thêm sách vào Neo4j
        const result = await session.run(
            `CREATE (b:Book {
                id: $id, name: $name, lang: $lang, category: $category,
                image: $image, title: $title, link: $link,
                content: $content, description: $description, author: $author
            }) RETURN b`,
            { id, name, lang, category, image, title, link, content, description, author }
        )

        const book = result.records[0].get('b').properties
        
        // 2. Tạo hoặc tìm node Author nếu có
        if (author) {
            await session.run(
                `MERGE (a:Author {name: $author}) RETURN a`,
                { author }
            )
            
            // 3. Tạo mối quan hệ giữa Book và Author
            await session.run(
                `MATCH (b:Book {id: $id}), (a:Author {name: $author})
                 MERGE (b)-[:WRITTEN_BY]->(a)`,
                { id, author }
            )
        }
        
        // 4. Tạo hoặc tìm node Category nếu có
        if (category) {
            await session.run(
                `MERGE (c:Category {name: $category}) RETURN c`,
                { category }
            )
            
            // 5. Tạo mối quan hệ giữa Book và Category
            await session.run(
                `MATCH (b:Book {id: $id}), (c:Category {name: $category})
                 MERGE (b)-[:BELONGS_TO]->(c)`,
                { id, category }
            )
        }

        res.status(200).json({ 
            success: true,
            message: "Thêm sách thành công và tạo mối quan hệ với tác giả và thể loại", 
            data: book 
        })
    } catch (error) {
        console.error("Lỗi khi thêm sách:", error);
        res.status(500).json({ 
            success: false,
            message: `Lỗi khi thêm sách: ${error.message}` 
        })
    } finally {
        await session.close()
    }
}

export default addBook