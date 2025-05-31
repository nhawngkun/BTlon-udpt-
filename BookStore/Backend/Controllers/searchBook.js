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

        // 1. Tìm sách theo thể loại (Category) chính xác
        let cypherQuery = `
            MATCH (b:Book)-[:BELONGS_TO]->(c:Category)
            WHERE toLower(c.name) CONTAINS $param
            RETURN DISTINCT b
        `;
        let result = await session.run(cypherQuery, { param });
        let books = result.records.map(record => record.get('b').properties);

        // 2. Nếu không có sách theo thể loại, tìm theo tên sách, tiêu đề hoặc tác giả
        if (books.length === 0) {
            cypherQuery = `
                MATCH (b:Book)
                OPTIONAL MATCH (b)-[:WRITTEN_BY]->(a:Author)
                WHERE toLower(b.name) CONTAINS $param
                   OR toLower(b.title) CONTAINS $param
                   OR (a.name IS NOT NULL AND toLower(a.name) CONTAINS $param)
                RETURN DISTINCT b
            `;
            result = await session.run(cypherQuery, { param });
            books = result.records.map(record => record.get('b').properties);
        }

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
