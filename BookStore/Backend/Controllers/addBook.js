import { v4 as uuidv4 } from 'uuid'
import driver from '../Database/dbconnection.js'
import { exec } from 'child_process';

const addBook = async (req, res) => {
    const session = driver.session()
    try {
        const id = uuidv4()
        const { name, lang, category, image, title, link, content, description, author } = req.body

        // 1. Thêm sách vào Neo4j trước
        const result = await session.run(
            `CREATE (b:Book {
                id: $id, name: $name, lang: $lang, category: $category,
                image: $image, title: $title, link: $link,
                content: $content, description: $description, author: $author
            }) RETURN b`,
            { id, name, lang, category, image, title, link, content, description, author }
        )

        const book = result.records[0].get('b').properties

        // 2. Sau khi thêm sách thành công, chạy seedBooksNeo4j.js để cập nhật sampleBooks.js
        exec('node seedBooksNeo4j.js', { cwd: __dirname + '/../' }, (err, stdout, stderr) => {
            if (err) {
                console.error('Error running seedBooksNeo4j.js:', err);
                return;
            }
            console.log('seedBooksNeo4j.js output:', stdout);

            // 3. Sau khi cập nhật sampleBooks.js, chạy syncBooksNeo4jFull.js để đồng bộ lại Neo4j
            exec('node syncBooksNeo4jFull.js', { cwd: __dirname + '/../' }, (err2, stdout2, stderr2) => {
                if (err2) {
                    console.error('Error running syncBooksNeo4jFull.js:', err2);
                    return;
                }
                console.log('syncBooksNeo4jFull.js output:', stdout2);
            });
        });

        res.status(200).json({ message: "Book added successfully", data: book })
    } catch (error) {
        res.status(500).json({ message: error.message })
    } finally {
        await session.close()
    }
}

export default addBook