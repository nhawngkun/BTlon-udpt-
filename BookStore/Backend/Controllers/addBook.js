import { v4 as uuidv4 } from 'uuid'
import driver from '../Database/dbconnection.js'

const addBook = async (req, res) => {
    const session = driver.session()
    try {
        const id = uuidv4()
        const { name, lang, category, image, title, link, content, description, author } = req.body

        // Chỉ thêm sách vào Neo4j
        const result = await session.run(
            `CREATE (b:Book {
                id: $id, name: $name, lang: $lang, category: $category,
                image: $image, title: $title, link: $link,
                content: $content, description: $description, author: $author
            }) RETURN b`,
            { id, name, lang, category, image, title, link, content, description, author }
        )

        const book = result.records[0].get('b').properties
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