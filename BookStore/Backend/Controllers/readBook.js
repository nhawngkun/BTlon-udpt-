import driver from '../Database/dbconnection.js';

const readBook = async (req, res) => {
    const session = driver.session();
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Book ID is required' });
        }

        const result = await session.run(
            'MATCH (b:Book {id: $id}) RETURN b',
            { id }
        );

        if (result.records.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const book = result.records[0].get('b').properties;

        res.status(200).json({
            id: book.id,
            name: book.name,
            lang: book.lang,
            category: book.category,
            image: book.image,
            title: book.title,
            description: book.description,
            content: book.content,
            link: book.link,
            author: book.author  // thêm dòng này
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
};

export default readBook;
