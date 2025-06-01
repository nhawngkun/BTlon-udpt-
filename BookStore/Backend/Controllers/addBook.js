import { v4 as uuidv4 } from 'uuid'
import driver from '../Database/dbconnection.js'

const addBook = async (req, res) => {
    const session = driver.session()
    try {
        console.log("Bắt đầu thêm sách vào Neo4j...")
        const id = uuidv4()
        const { name, lang, category, image, title, link, content, description, author } = req.body
        
        // Đảm bảo giá trị mặc định cho các trường quan trọng
        const actualAuthor = author || 'Unknown Author'
        const actualCategory = category || 'General'
        
        console.log(`Chi tiết sách: ID=${id}, Tên=${name}, Tác giả=${actualAuthor}, Thể loại=${actualCategory}`)
        
        // Chỉ tạo node Book, không tạo quan hệ - các quan hệ sẽ được tạo bởi API riêng
        const result = await session.run(
            `CREATE (b:Book {
                id: $id, name: $name, lang: $lang, category: $actualCategory,
                image: $image, title: $title, link: $link,
                content: $content, description: $description, author: $actualAuthor
            }) RETURN b`,
            { id, name, lang, actualCategory, image, title, link, content, description, actualAuthor }
        )
        
        console.log("✅ Đã tạo node Book thành công")
        
        const book = result.records[0].get('b').properties
        res.status(200).json({ 
            success: true,
            message: "Thêm sách thành công. Sách sẽ được liên kết với tác giả và thể loại.", 
            data: book 
        })
    } catch (error) {
        console.error("❌ Lỗi khi thêm sách vào Neo4j:", error)
        res.status(500).json({ 
            success: false,
            message: `Lỗi khi thêm sách vào Neo4j: ${error.message}` 
        })
    } finally {
        await session.close()
    }
}

export default addBook