import express from 'express';
import driver from '../Database/dbconnection.js';

const router = express.Router();

const searchBook = async (req, res) => {
    const session = driver.session();
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json([]);
        }

        let cypherQuery = '';
        let param = '';

        if (query.startsWith('category:')) {
            param = query.replace('category:', '').trim();
            cypherQuery = `
                MATCH (b:Book)-[:BELONGS_TO]->(c:Category)
                WHERE toLower(c.name) CONTAINS toLower($param)
                RETURN b
            `;
        } else if (query.startsWith('author:')) {
            param = query.replace('author:', '').trim();
            cypherQuery = `
                MATCH (b:Book)-[:WRITTEN_BY]->(a:Author)
                WHERE toLower(a.name) CONTAINS toLower($param)
                RETURN b
            `;
        } else {
            param = query;
            cypherQuery = `
                MATCH (b:Book)
                OPTIONAL MATCH (b)-[:WRITTEN_BY]->(a:Author)
                OPTIONAL MATCH (b)-[:BELONGS_TO]->(c:Category)
                WHERE toLower(b.name) CONTAINS toLower($param)
                   OR toLower(b.title) CONTAINS toLower($param)
                   OR toLower(b.category) CONTAINS toLower($param)
                   OR toLower(b.author) CONTAINS toLower($param)
                   OR toLower(a.name) CONTAINS toLower($param)
                   OR toLower(c.name) CONTAINS toLower($param)
                RETURN b
            `;
        }

        const result = await session.run(cypherQuery, { param });

        const books = result.records.map(record => record.get('b').properties);
        res.status(200).json(books);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await session.close();
    }
};

router.get('/books/search', searchBook);

export default router;
