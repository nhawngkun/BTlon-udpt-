import driver from '../Database/dbconnection.js'

const getBook = async (req, res) => {
    const session = driver.session()
    try {
        const result = await session.run(
            `MATCH (b:Book {id: $id}) RETURN b`,
            { id: req.params.id }
        )

        if (result.records.length === 0) {
            return res.status(404).json({ message: "Book not found" })
        }

        const book = result.records[0].get('b').properties
        res.status(200).json(book)
    } catch (error) {
        res.status(500).json({ message: error.message })
    } finally {
        await session.close()
    }
}

export default getBook
