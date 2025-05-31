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
        const param = query.trim();

        // Tìm kiếm theo tên sách, tên tác giả, tên thể loại (không cần prefix)
        const cypherQuery = `
            MATCH (b:Book)
            OPTIONAL MATCH (b)-[:WRITTEN_BY]->(a:Author)
            OPTIONAL MATCH (b)-[:BELONGS_TO]->(c:Category)
            WHERE
                toLower(b.name) CONTAINS toLower($param)
                OR (a.name IS NOT NULL AND toLower(a.name) CONTAINS toLower($param))
                OR (c.name IS NOT NULL AND toLower(c.name) CONTAINS toLower($param))
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
