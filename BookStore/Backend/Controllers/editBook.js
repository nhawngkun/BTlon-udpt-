import driver from '../Database/dbconnection.js'

const editBook = async (req, res) => {
    const session = driver.session()
    try {
        const { id } = req.params
        const { name, lang, category, image, title, link, content, description } = req.body
        const author = 'Tác giả B'

        await session.run(
            `MATCH (b:Book {id: $id})
            SET b.name = $name, b.lang = $lang, b.category = $category,
                b.image = $image, b.title = $title, b.link = $link,
                b.content = $content, b.description = $description,
                b.author = $author
            RETURN b`,
            { id, name, lang, category, image, title, link, content, description, author }
        )

        res.json({ message: "Book updated successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    } finally {
        await session.close()
    }
}

export default editBook
