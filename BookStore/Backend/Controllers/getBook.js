import driver from '../Database/dbconnection.js';

const editprofile = async (req, res) => {
    const session = driver.session();
    try {
        const userResult = await session.run(
            'MATCH (u:User {id: $id}) RETURN u',
            { id: req.params.id }
        );

        if (userResult.records.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updateQuery = `
      MATCH (u:User {id: $id})
      SET u += $updates
      RETURN u
    `;

        const updates = req.body;
        const updateResult = await session.run(updateQuery, {
            id: req.params.id,
            updates
        });

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
};

export default editprofile;
