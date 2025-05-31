import driver from '../Database/dbconnection.js';
import { exec } from 'child_process';

// Lấy tất cả người dùng
export const getAllUsers = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (u:User) RETURN u ORDER BY u.role');
    
    const users = result.records.map(record => {
      const user = record.get('u').properties;
      // Không trả về password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await session.close();
  }
};

// Lấy thống kê
export const getStats = async (req, res) => {
  const session = driver.session();
  try {
    // Đếm tổng số người dùng
    const userCountResult = await session.run('MATCH (u:User) RETURN count(u) as userCount');
    const userCount = userCountResult.records[0].get('userCount').toNumber();
    
    // Đếm số sách
    const bookCountResult = await session.run('MATCH (b:Book) RETURN count(b) as bookCount');
    const bookCount = bookCountResult.records[0].get('bookCount').toNumber();
    
    // Đếm số người dùng theo vai trò
    const roleCountResult = await session.run(`
      MATCH (u:User)
      RETURN u.role as role, count(u) as count
    `);
    
    const roleCounts = roleCountResult.records.map(record => ({
      role: record.get('role'),
      count: record.get('count').toNumber()
    }));
    
    // Đếm số sách theo thể loại
    const categoryCountResult = await session.run(`
      MATCH (b:Book)
      RETURN b.category as category, count(b) as count
    `);
    
    const categoryCounts = categoryCountResult.records.map(record => ({
      category: record.get('category'),
      count: record.get('count').toNumber()
    }));
    
    res.status(200).json({
      totalUsers: userCount,
      totalBooks: bookCount,
      usersByRole: roleCounts,
      booksByCategory: categoryCounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await session.close();
  }
};

// Xóa người dùng
export const deleteUser = async (req, res) => {
  const session = driver.session();
  try {
    const { id } = req.params;
    
    // Kiểm tra người dùng tồn tại
    const checkResult = await session.run(
      'MATCH (u:User {id: $id}) RETURN u',
      { id }
    );
    
    if (checkResult.records.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Không cho phép xóa tài khoản admin
    const user = checkResult.records[0].get('u').properties;
    if (user.role === 'Admin') {
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }
    
    // Xóa người dùng
    await session.run(
      'MATCH (u:User {id: $id}) DETACH DELETE u',
      { id }
    );
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await session.close();
  }
};

// API chỉ chạy seedBooksNeo4j.js để cập nhật file sampleBooks.js
export const runSeedBooks = (req, res) => {
  console.log("Starting process to update sampleBooks.js from Neo4j database...");
  exec('node seedBooksNeo4j.js', { cwd: __dirname + '/../' }, (err, stdout, stderr) => {
    if (err) {
      console.error('Error running seedBooksNeo4j.js:', err);
      console.error('stderr:', stderr);
      return res.status(500).json({ message: 'Seed failed', error: err.message, stderr });
    }
    console.log('seedBooksNeo4j.js output:', stdout);
    if (stderr) {
      console.log('seedBooksNeo4j.js stderr:', stderr);
    }
    res.status(200).json({ message: 'Seed completed', output: stdout });
  });
};

// API chạy syncBooksNeo4jFull.js để đồng bộ từ file sampleBooks.js lên Neo4j
export const syncBooksNeo4j = (req, res) => {
  // Thêm độ trễ 5 giây trước khi chạy syncBooksNeo4jFull.js
  console.log('Waiting 5 seconds before running syncBooksNeo4jFull.js...');
  
  setTimeout(() => {
    console.log('Starting syncBooksNeo4jFull.js after delay...');
    
    exec('node syncBooksNeo4jFull.js', { cwd: __dirname + '/../' }, (err, stdout, stderr) => {
      if (err) {
        console.error('Error running syncBooksNeo4jFull.js:', err);
        console.error('stderr:', stderr);
        return res.status(500).json({ 
          message: 'Sync failed', 
          error: err.message,
          stderr 
        });
      }
      console.log('syncBooksNeo4jFull.js output:', stdout);
      if (stderr) {
        console.log('syncBooksNeo4jFull.js stderr:', stderr);
      }
      res.status(200).json({ 
        message: 'Sync completed', 
        output: stdout 
      });
    });
  }, 5000); // Giảm thời gian đợi xuống 5 giây (5000 ms)
};
