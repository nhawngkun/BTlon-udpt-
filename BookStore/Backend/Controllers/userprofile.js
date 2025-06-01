import driver from '../Database/dbconnection.js';

const userprofile = async (req, res) => {
    const session = driver.session();
    try {
        const userResult = await session.run(
            'MATCH (u:User {id: $id}) RETURN u',
            { id: req.params.id }
        );

        if (userResult.records.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userNode = userResult.records[0].get('u').properties;
        res.status(200).json(userNode);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.close();
    }
};

export default userprofile;
