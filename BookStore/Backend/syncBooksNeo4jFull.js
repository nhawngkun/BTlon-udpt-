import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import sampleBooks from './sampleBooks.js'; // Thay thế cho biến cục bộ

dotenv.config({ path: './Config/config.env' }); // Đảm bảo đúng đường dẫn

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

const session = driver.session();

async function syncBooksWithAuthors() {
  try {
    // Xóa sạch dữ liệu cũ
    console.log('Xóa dữ liệu cũ...');
    await session.run('MATCH (b:Book) DETACH DELETE b');
    await session.run('MATCH (a:Author) DETACH DELETE a');
    await session.run('MATCH (c:Category) DETACH DELETE c');
    console.log('✅ Đã xóa sách, tác giả và thể loại cũ');

    console.log(`Bắt đầu đồng bộ ${sampleBooks.length} sách...`);
    for (let i = 0; i < sampleBooks.length; i++) {
      const book = sampleBooks[i];
      console.log(`[${i+1}/${sampleBooks.length}] Đang xử lý sách: ${book.name}`);
      
      // 1. Tạo node Book
      await session.run(
        `CREATE (b:Book {
          id: $id,
          name: $name,
          author: $author,
          lang: $lang,
          category: $category,
          image: $image,
          title: $title,
          link: $link,
          content: $content,
          description: $description,
          readCount: 0
        })`,
        book
      );
      console.log(`  ✓ Đã tạo sách: ${book.name}`);

      // 2. Tạo hoặc tìm node Author
      await session.run(
        `MERGE (a:Author {name: $author})`,
        { author: book.author }
      );
      console.log(`  ✓ Đã tạo/tìm tác giả: ${book.author}`);
      
      // 3. Tạo hoặc tìm node Category
      await session.run(
        `MERGE (c:Category {name: $category})`, 
        { category: book.category }
      );
      console.log(`  ✓ Đã tạo/tìm thể loại: ${book.category}`);

      // 4. Nối Book với Author qua quan hệ WRITTEN_BY
      await session.run(
        `MATCH (b:Book {id: $id}), (a:Author {name: $author})
         MERGE (b)-[:WRITTEN_BY]->(a)`,
        { id: book.id, author: book.author }
      );
      console.log(`  ✓ Đã nối sách với tác giả: ${book.name} -> ${book.author}`);
      
      // 5. Nối Book với Category qua quan hệ BELONGS_TO
      await session.run(
        `MATCH (b:Book {id: $id}), (c:Category {name: $category})
         MERGE (b)-[:BELONGS_TO]->(c)`,
        { id: book.id, category: book.category }
      );
      console.log(`  ✓ Đã nối sách với thể loại: ${book.name} -> ${book.category}`);

      console.log(`✅ Hoàn thành xử lý sách: ${book.name}`);
    }

    console.log('✅ Đã hoàn tất đồng bộ sách với tác giả và thể loại');
  } catch (error) {
    console.error('❌ Lỗi khi đồng bộ dữ liệu:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

syncBooksWithAuthors();
