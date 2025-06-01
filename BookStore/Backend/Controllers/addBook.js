import { v4 as uuidv4 } from 'uuid'
import driver from '../Database/dbconnection.js'

const addBook = async (req, res) => {
    const session = driver.session()
    try {
        const id = uuidv4()
        const { name, lang, category, image, title, link, content, description, author } = req.body

        // LƯU Ý: Chức năng này chỉ thêm sách vào Neo4j.
        // Nếu muốn cập nhật file sampleBooks.js, bạn cần ấn nút "Xuất sách vào file sampleBooks" 
        // Nếu muốn đồng bộ dữ liệu từ file sampleBooks.js lên Neo4j, bạn cần ấn nút "Đồng bộ file lên Neo4j"
        const result = await session.run(
            `CREATE (b:Book {
                id: $id, name: $name, lang: $lang, category: $category,
                image: $image, title: $title, link: $link,
                content: $content, description: $description, author: $author
            }) RETURN b`,
            { id, name, lang, category, image, title, link, content, description, author }
        )

        const book = result.records[0].get('b').properties
        res.status(200).json({ message: "Sách đã được thêm thành công vào Neo4j", data: book })
    } catch (error) {
        res.status(500).json({ message: error.message })
    } finally {
        await session.close()
    }
}

export default addBook