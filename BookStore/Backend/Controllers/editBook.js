import driver from '../Database/dbconnection.js'
import { standardizeCategory, standardizeAuthor } from '../utils/stringUtils.js'

const editBook = async (req, res) => {
    const session = driver.session()
    try {
        const { id } = req.params
        const { name, lang, category, image, title, link, content, description, author } = req.body

        // Standardize category and author names
        const standardizedCategory = standardizeCategory(category)
        const standardizedAuthor = standardizeAuthor(author)

        // Tìm sách và cập nhật
        const result = await session.run(
            `MATCH (b:Book {id: $id})
             SET b.name = $name, b.lang = $lang, b.category = $standardizedCategory,
                 b.image = $image, b.title = $title, b.link = $link,
                 b.content = $content, b.description = $description,
                 b.author = $standardizedAuthor
             RETURN b`,
            { id, name, lang, standardizedCategory, image, title, link, content, description, standardizedAuthor }
        )

        if (result.records.length === 0) {
            return res.status(404).json({ message: 'Book not found' })
        }

        // Cập nhật mối quan hệ với Author (xóa cũ, tạo mới)
        await session.run(
            `MATCH (b:Book {id: $id})-[r:WRITTEN_BY]->() DELETE r`,
            { id }
        )
        
        if (standardizedAuthor) {
            // Tạo hoặc tìm Author
            await session.run(
                `MERGE (a:Author {name: $standardizedAuthor}) RETURN a`,
                { standardizedAuthor }
            )
            
            // Tạo mối quan hệ mới
            await session.run(
                `MATCH (b:Book {id: $id}), (a:Author {name: $standardizedAuthor})
                 MERGE (b)-[:WRITTEN_BY]->(a)`,
                { id, standardizedAuthor }
            )
        }
        
        // Cập nhật mối quan hệ với Category
        await session.run(
            `MATCH (b:Book {id: $id})-[r:BELONGS_TO]->() DELETE r`,
            { id }
        )
        
        if (standardizedCategory) {
            // Tạo hoặc tìm Category
            await session.run(
                `MERGE (c:Category {name: $standardizedCategory}) RETURN c`,
                { standardizedCategory }
            )
            
            // Tạo mối quan hệ mới
            await session.run(
                `MATCH (b:Book {id: $id}), (c:Category {name: $standardizedCategory})
                 MERGE (b)-[:BELONGS_TO]->(c)`,
                { id, standardizedCategory }
            )
        }

        res.status(200).json({
            message: 'Book updated successfully',
            book: result.records[0].get('b').properties
        })
    } catch (error) {
        console.error("Error updating book:", error)
        res.status(500).json({ message: error.message })
    } finally {
        await session.close()
    }
}

export default editBook
