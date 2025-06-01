import { v4 as uuidv4 } from 'uuid'
import driver from '../Database/dbconnection.js'
import { standardizeCategory, standardizeAuthor } from '../utils/stringUtils.js'

const addBook = async (req, res) => {
    const session = driver.session()
    try {
        const id = uuidv4()
        const { name, lang, category, image, title, link, content, description, author } = req.body

        // Standardize the category and author names
        const standardizedCategory = standardizeCategory(category)
        const standardizedAuthor = standardizeAuthor(author)

        // 1. Thêm sách vào Neo4j
        const result = await session.run(
            `CREATE (b:Book {
                id: $id, name: $name, lang: $lang, category: $standardizedCategory,
                image: $image, title: $title, link: $link,
                content: $content, description: $description, author: $standardizedAuthor
            }) RETURN b`,
            { id, name, lang, standardizedCategory, image, title, link, content, description, standardizedAuthor }
        )

        const book = result.records[0].get('b').properties
        
        // 2. Tạo hoặc tìm node Author nếu có
        if (standardizedAuthor) {
            await session.run(
                `MERGE (a:Author {name: $standardizedAuthor}) RETURN a`,
                { standardizedAuthor }
            )
            
            // 3. Tạo mối quan hệ giữa Book và Author
            await session.run(
                `MATCH (b:Book {id: $id}), (a:Author {name: $standardizedAuthor})
                 MERGE (b)-[:WRITTEN_BY]->(a)`,
                { id, standardizedAuthor }
            )
        }
        
        // 4. Tạo hoặc tìm node Category nếu có
        if (standardizedCategory) {
            await session.run(
                `MERGE (c:Category {name: $standardizedCategory}) RETURN c`,
                { standardizedCategory }
            )
            
            // 5. Tạo mối quan hệ giữa Book và Category
            await session.run(
                `MATCH (b:Book {id: $id}), (c:Category {name: $standardizedCategory})
                 MERGE (b)-[:BELONGS_TO]->(c)`,
                { id, standardizedCategory }
            )
        }

        res.status(200).json({ 
            success: true,
            message: "Thêm sách thành công", 
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