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

// API tạo các quan hệ cho sách với tác giả và thể loại
export const connectBookRelationships = async (req, res) => {
  const session = driver.session();
  try {
    const { bookId, author, category } = req.body;
    
    console.log(`[INFO] Nhận yêu cầu kết nối quan hệ:`, { bookId, author, category });
    
    // Kiểm tra và xử lý dữ liệu đầu vào
    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin: bookId là bắt buộc"
      });
    }
    
    // Đảm bảo có giá trị mặc định cho tác giả và thể loại
    const actualAuthor = author || 'Unknown Author';
    const actualCategory = category || 'General';
    
    console.log(`[LOG] Bắt đầu kết nối sách ID=${bookId} với tác giả="${actualAuthor}" và thể loại="${actualCategory}"`);
    
    // KIỂM TRA BƯỚC 0: Kiểm tra sự tồn tại của sách
    console.log("[LOG] Kiểm tra sự tồn tại của sách...");
    const bookCheckResult = await session.run(
      `MATCH (b:Book {id: $bookId}) RETURN b`,
      { bookId }
    );
    
    if (bookCheckResult.records.length === 0) {
      console.error(`[ERROR] ❌ Không tìm thấy sách với ID=${bookId}`);
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sách với ID: ${bookId}`
      });
    }
    
    const bookName = bookCheckResult.records[0].get('b').properties.name;
    console.log(`[LOG] ✓ Tìm thấy sách: "${bookName}" (ID: ${bookId})`);
    
    try {
      // 1. Tạo hoặc tìm node Author
      console.log(`[LOG] 1. Tạo/tìm node Author "${actualAuthor}"...`);
      await session.run(
        `MERGE (a:Author {name: $actualAuthor}) RETURN a`,
        { actualAuthor }
      );
      console.log(`[LOG] ✓ Đã xử lý tác giả: ${actualAuthor}`);
      
      // 2. Tạo hoặc tìm node Category
      console.log(`[LOG] 2. Tạo/tìm node Category "${actualCategory}"...`);
      await session.run(
        `MERGE (c:Category {name: $actualCategory}) RETURN c`,
        { actualCategory }
      );
      console.log(`[LOG] ✓ Đã xử lý thể loại: ${actualCategory}`);
      
      // 3. Nối Book với Author qua quan hệ WRITTEN_BY
      console.log(`[LOG] 3. Tạo quan hệ Book-Author: "${bookName}" -> "${actualAuthor}"...`);
      const authorRelResult = await session.run(
        `MATCH (b:Book {id: $bookId})
         MATCH (a:Author {name: $actualAuthor})
         MERGE (b)-[:WRITTEN_BY]->(a)
         RETURN b, a`,
        { bookId, actualAuthor }
      );
      console.log(`[LOG] ✓ Đã tạo quan hệ sách-tác giả thành công`);
      
      // 4. Nối Book với Category qua quan hệ BELONGS_TO
      console.log(`[LOG] 4. Tạo quan hệ Book-Category: "${bookName}" -> "${actualCategory}"...`);
      const categoryRelResult = await session.run(
        `MATCH (b:Book {id: $bookId})
         MATCH (c:Category {name: $actualCategory})
         MERGE (b)-[:BELONGS_TO]->(c)
         RETURN b, c`,
        { bookId, actualCategory }
      );
      console.log(`[LOG] ✓ Đã tạo quan hệ sách-thể loại thành công`);
      
      console.log(`[SUCCESS] ✅ Đã kết nối thành công sách "${bookName}" với tác giả "${actualAuthor}" và thể loại "${actualCategory}"`);
      
      res.status(200).json({
        success: true,
        message: "Đã kết nối sách với tác giả và thể loại thành công",
        details: {
          book: bookName,
          bookId: bookId,
          author: actualAuthor,
          category: actualCategory
        }
      });
    } catch (queryError) {
      console.error("[ERROR] ❌ Lỗi khi thực hiện truy vấn Neo4j:", queryError);
      throw new Error(`Lỗi khi tạo quan hệ: ${queryError.message}`);
    }
  } catch (error) {
    console.error("[ERROR] ❌ Lỗi khi kết nối quan hệ:", error);
    res.status(500).json({ 
      success: false,
      message: `Lỗi khi kết nối sách với tác giả và thể loại: ${error.message}`
    });
  } finally {
    await session.close();
  }
};
