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
    await session.run('MATCH (b:Book) DETACH DELETE b');
    await session.run('MATCH (a:Author) DETACH DELETE a');
    await session.run('MATCH (c:Category) DETACH DELETE c');
    console.log('Deleted all existing books and authors');

    for (const book of sampleBooks) {
      // Tạo node Book
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
          description: $description
        })`,
        book
      );

      // Tạo hoặc tìm node Author
      await session.run(
        `MERGE (a:Author {name: $author})`,
        { author: book.author }
      );
       await session.run(`MERGE (c:Category {name: $category})`, { category: book.category });

      // Nối Book với Author
      await session.run(
        `MATCH (b:Book {id: $id}), (a:Author {name: $author})
         MERGE (b)-[:WRITTEN_BY]->(a)`,
        { id: book.id, author: book.author }
      );
      await session.run(
        `MATCH (b:Book {id: $id}), (c:Category {name: $category})
         MERGE (b)-[:BELONGS_TO]->(c)`,
        { id: book.id, category: book.category }
      );

      console.log(`Created book '${book.name}' and linked to author '${book.author}'`);
    }

    console.log('Finished syncing books with authors');
  } catch (error) {
    console.error('Error syncing books with authors:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

syncBooksWithAuthors();
