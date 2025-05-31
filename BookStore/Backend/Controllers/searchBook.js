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

        let cypherQuery = '';

        if (param.startsWith('category:')) {
            const cat = param.replace('category:', '').trim();
            if (!cat) return res.status(400).json([]);
            cypherQuery = `
                MATCH (b:Book)-[:BELONGS_TO]->(c:Category)
                WHERE toLower(c.name) CONTAINS toLower($param)
                RETURN b
            `;
            const result = await session.run(cypherQuery, { param: cat });
            const books = result.records.map(record => record.get('b').properties);
            return res.status(200).json(books);
        } else if (param.startsWith('author:')) {
            const author = param.replace('author:', '').trim();
            if (!author) return res.status(400).json([]);
            cypherQuery = `
                MATCH (b:Book)-[:WRITTEN_BY]->(a:Author)
                WHERE toLower(a.name) CONTAINS toLower($param)
                RETURN b
            `;
            const result = await session.run(cypherQuery, { param: author });
            const books = result.records.map(record => record.get('b').properties);
            return res.status(200).json(books);
        } else {
            // Tìm theo tên sách (Book.name)
            cypherQuery = `
                MATCH (b:Book)
                WHERE toLower(b.name) CONTAINS toLower($param)
                RETURN b
            `;
            const result = await session.run(cypherQuery, { param });
            const books = result.records.map(record => record.get('b').properties);
            return res.status(200).json(books);
        }
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await session.close();
    }
};

router.get('/books/search', searchBook);

export default router;
