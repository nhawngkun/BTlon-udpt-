import { v4 as uuidv4 } from 'uuid'
import driver from '../Database/dbconnection.js'

const addBook = async (req, res) => {
    const session = driver.session()
    try {
        console.log("[LOG] Bắt đầu thêm sách mới vào Neo4j...")
        const id = uuidv4()
        const { name, lang, category, image, title, link, content, description, author } = req.body
        
        // Kiểm tra dữ liệu đầu vào cần thiết
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Tên sách là trường bắt buộc"
            });
        }
        
        // Đảm bảo giá trị mặc định cho các trường quan trọng
        const actualAuthor = author || 'Unknown Author'
        const actualCategory = category || 'General'
        const actualLang = lang || 'Vietnamese'
        
        console.log(`[LOG] Chi tiết sách mới:`, {
            ID: id,
            Tên: name,
            Tác_giả: actualAuthor,
            Thể_loại: actualCategory,
            Ngôn_ngữ: actualLang
        })
        
        // Tạo node Book mới trong Neo4j
        const result = await session.run(
            `CREATE (b:Book {
                id: $id, 
                name: $name, 
                lang: $actualLang, 
                category: $actualCategory,
                image: $image, 
                title: $title, 
                link: $link,
                content: $content, 
                description: $description, 
                author: $actualAuthor,
                createdAt: timestamp()
            }) RETURN b`,
            { id, name, actualLang, actualCategory, image, title, link, content, description, actualAuthor }
        )
        
        console.log(`[SUCCESS] ✅ Đã tạo sách mới thành công với ID: ${id}`)
        console.log(`[INFO] Sách đã được thêm với thông tin: tác giả="${actualAuthor}" và thể loại="${actualCategory}"`)
        console.log(`[INFO] Tiếp theo cần gọi API connect-book-relationships để tạo quan hệ đồ thị`)
        
        const book = result.records[0].get('b').properties
        res.status(200).json({ 
            success: true,
            message: "Thêm sách thành công. Đang tiếp tục liên kết với tác giả và thể loại.", 
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