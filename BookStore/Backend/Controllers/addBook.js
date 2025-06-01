import { v4 as uuidv4 } from 'uuid'
import driver from '../Database/dbconnection.js'

const addBook = async (req, res) => {
    const session = driver.session()
    try {
        console.log("[LOG] Bắt đầu thêm sách vào Neo4j...")
        const id = uuidv4()
        const { name, lang, category, image, title, link, content, description, author } = req.body
        
        if (!name || !category || !author) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin: name, category và author là bắt buộc"
            });
        }
        
        // Đảm bảo giá trị mặc định cho các trường quan trọng
        const actualAuthor = author || 'Unknown Author'
        const actualCategory = category || 'General'
        
        console.log(`[LOG] Chi tiết sách: ID=${id}, Tên=${name}, Tác giả=${actualAuthor}, Thể loại=${actualCategory}`)
        
        // Chỉ tạo node Book, không tạo quan hệ - các quan hệ sẽ được tạo bởi API riêng
        const result = await session.run(
            `CREATE (b:Book {
                id: $id, 
                name: $name, 
                lang: $lang, 
                category: $actualCategory,
                image: $image, 
                title: $title, 
                link: $link,
                content: $content, 
                description: $description, 
                author: $actualAuthor
            }) RETURN b`,
            { id, name, lang, actualCategory, image, title, link, content, description, actualAuthor }
        )
        
        console.log(`[SUCCESS] ✅ Đã tạo node Book thành công với ID=${id}`)
        
        const book = result.records[0].get('b').properties
        res.status(200).json({ 
            success: true,
            message: "Thêm sách thành công. Sách sẽ được liên kết với tác giả và thể loại.", 
            data: book 
        })
    } catch (error) {
        console.error("[ERROR] ❌ Lỗi khi thêm sách vào Neo4j:", error)
        res.status(500).json({ 
            success: false,
            message: `Lỗi khi thêm sách vào Neo4j: ${error.message}` 
        })
    } finally {
        await session.close()
    }
}

export default addBook