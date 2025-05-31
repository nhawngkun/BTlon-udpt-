import express from 'express';
import driver from '../Database/dbconnection.js';

const router = express.Router();

const searchBook = async (req, res) => {
    const session = driver.session();
    try {
        const { query } = req.query;

        if (!query || !query.trim()) {
            return res.status(400).json([]);
        }

        const param = query.trim().toLowerCase();

        // Câu lệnh Cypher đã được chỉnh sửa để tránh lỗi lọc sai
        const cypherQuery = `
            MATCH (b:Book)
            OPTIONAL MATCH (b)-[:WRITTEN_BY]->(a:Author)
            OPTIONAL MATCH (b)-[:BELONGS_TO]->(c:Category)
            WITH b, a, c,
                toLower(b.name) AS bookName,
                toLower(b.title) AS bookTitle,
                toLower(a.name) AS authorName,
                toLower(c.name) AS categoryName
            WHERE bookName CONTAINS $param
               OR bookTitle CONTAINS $param
               OR authorName CONTAINS $param
               OR categoryName CONTAINS $param
            RETURN DISTINCT b
        `;

        const result = await session.run(cypherQuery, { param });
        const books = result.records.map(record => record.get('b').properties);

        return res.status(200).json(books);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await session.close();
    }
};

router.get('/books/search', searchBook);

export default router;
