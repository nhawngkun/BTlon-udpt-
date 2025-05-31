import { v4 as uuidv4 } from 'uuid'
import driver from '../Database/dbconnection.js'
import { exec } from 'child_process';

const addBook = async (req, res) => {
    const session = driver.session()
    try {
        const id = uuidv4()
        const { name, lang, category, image, title, link, content, description, author } = req.body

        // Kiểm tra đầu vào
        if (!name || !lang || !category || !image || !title || !content || !author) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Thêm sách vào Neo4j
        const result = await session.run(
            `CREATE (b:Book {
                id: $id, name: $name, lang: $lang, category: $category,
                image: $image, title: $title, link: $link,
                content: $content, description: $description, author: $author
            }) RETURN b`,
            { id, name, lang, category, image, title, link, content, description, author }
        )

        const book = result.records[0].get('b').properties

        // Sau khi thêm sách thành công, cập nhật lại sampleBooks.js
        exec('node seedBooksNeo4j.js', { cwd: __dirname + '/../' }, (err, stdout, stderr) => {
            if (err) {
                console.error('Error running seedBooksNeo4j.js:', err);
                return;
            }
            console.log('seedBooksNeo4j.js output:', stdout);

            // Đợi 1 giây rồi mới chạy syncBooksNeo4jFull.js
            setTimeout(() => {
                exec('node syncBooksNeo4jFull.js', { cwd: __dirname + '/../' }, (err2, stdout2, stderr2) => {
                    if (err2) {
                        console.error('Error running syncBooksNeo4jFull.js:', err2);
                        return;
                    }
                    console.log('syncBooksNeo4jFull.js output:', stdout2);
                });
            }, 1000);
        });

        res.status(200).json({ message: "Book added successfully", data: book })
    } catch (error) {
        res.status(500).json({ message: error.message })
    } finally {
        await session.close()
    }
}

export default addBook