import driver from '../Database/dbconnection.js';
import { exec } from 'child_process';
import { standardizeCategory, standardizeAuthor } from '../utils/stringUtils.js';

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
  console.log('Chạy thủ công seedBooksNeo4j.js: Chức năng này cập nhật file sampleBooks.js từ dữ liệu Neo4j');
  exec('node seedBooksNeo4j.js', { cwd: __dirname + '/../' }, (err, stdout, stderr) => {
    if (err) {
      console.error('Error running seedBooksNeo4j.js:', err);
      return res.status(500).json({ message: 'Seed failed', error: err.message });
    }
    console.log('seedBooksNeo4j.js output:', stdout);
    res.status(200).json({ message: 'Seed completed', output: stdout });
  });
};

// API chạy syncBooksNeo4jFull.js để đồng bộ từ file sampleBooks.js lên Neo4j
export const syncBooksNeo4j = (req, res) => {
  console.log('Chạy thủ công syncBooksNeo4jFull.js: Chức năng này đồng bộ dữ liệu từ file sampleBooks.js lên Neo4j');
  
  // Không còn độ trễ 10 giây
  exec('node syncBooksNeo4jFull.js', { cwd: __dirname + '/../' }, (err, stdout, stderr) => {
    if (err) {
      console.error('Error running syncBooksNeo4jFull.js:', err);
      return res.status(500).json({ message: 'Sync failed', error: err.message });
    }
    console.log('syncBooksNeo4jFull.js output:', stdout);
    res.status(200).json({ 
      message: 'Đã đồng bộ dữ liệu từ file sampleBooks.js lên Neo4j thành công', 
      output: stdout 
    });
  });
};

// Thêm vào cuối file:
export const connectBookRelationships = async (req, res) => {
  const session = driver.session();
  try {
    const { bookId, author, category } = req.body;
    if (!bookId) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin: bookId là bắt buộc" });
    }
    
    // Standardize author and category names
    const actualAuthor = standardizeAuthor(author);
    const actualCategory = standardizeCategory(category);

    // Kiểm tra sự tồn tại của sách
    const bookCheckResult = await session.run(
      `MATCH (b:Book {id: $bookId}) RETURN b`,
      { bookId }
    );
    if (bookCheckResult.records.length === 0) {
      return res.status(404).json({ success: false, message: `Không tìm thấy sách với ID: ${bookId}` });
    }

    // Tạo/tìm Author
    await session.run(`MERGE (a:Author {name: $actualAuthor}) RETURN a`, { actualAuthor });
    // Tạo/tìm Category
    await session.run(`MERGE (c:Category {name: $actualCategory}) RETURN c`, { actualCategory });
    // Nối Book với Author
    await session.run(
      `MATCH (b:Book {id: $bookId}) MATCH (a:Author {name: $actualAuthor}) MERGE (b)-[:WRITTEN_BY]->(a) RETURN b, a`,
      { bookId, actualAuthor }
    );
    // Nối Book với Category
    await session.run(
      `MATCH (b:Book {id: $bookId}) MATCH (c:Category {name: $actualCategory}) MERGE (b)-[:BELONGS_TO]->(c) RETURN b, c`,
      { bookId, actualCategory }
    );

    res.status(200).json({
      success: true,
      message: "Đã kết nối sách với tác giả và thể loại thành công",
      relationships: { bookId, author: actualAuthor, category: actualCategory }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Lỗi khi kết nối sách với tác giả và thể loại: ${error.message}` });
  } finally {
    await session.close();
  }
};
