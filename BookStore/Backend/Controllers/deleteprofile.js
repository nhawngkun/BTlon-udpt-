import driver from '../Database/dbconnection.js'

const deleteBook = async (req, res) => {
    const session = driver.session()
    try {
        const result = await session.run(
            `MATCH (b:Book {id: $id}) DETACH DELETE b RETURN COUNT(b) as deleted`,
            { id: req.params.id }
        )

        res.status(200).json({ message: "Book deleted successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    } finally {
        await session.close()
    }
}

export default deleteBook
