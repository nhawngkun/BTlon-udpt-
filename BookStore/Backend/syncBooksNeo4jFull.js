import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import sampleBooks from './sampleBooks.js';

dotenv.config({ path: './Config/config.env' });

console.log("Starting sync process from sampleBooks.js to Neo4j...");
console.log(`Number of books to sync: ${sampleBooks.length}`);

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'neo4j+s://58270351.databases.neo4j.io',
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME || 'neo4j', 
    process.env.NEO4J_PASSWORD || 'UlXPYheImRAqEPXhXehOLc89qRc9AKM6us2x2VJHgkY'
  )
);
//
const session = driver.session();

async function syncBooksWithAuthors() {
  try {
    console.log("Connecting to Neo4j database...");
    console.log(`URI: ${process.env.NEO4J_URI || 'neo4j+s://58270351.databases.neo4j.io'}`);
    
    // Xóa sạch dữ liệu cũ
    console.log("Cleaning old data...");
    await session.run('MATCH (b:Book) DETACH DELETE b');
    await session.run('MATCH (a:Author) DETACH DELETE a');
    await session.run('MATCH (c:Category) DETACH DELETE c');
    console.log('✅ Deleted all existing books, authors, and categories');

    console.log("Starting to create new books, authors, and categories...");
    for (let i = 0; i < sampleBooks.length; i++) {
      const book = sampleBooks[i];
      console.log(`Processing book ${i+1}/${sampleBooks.length}: ${book.name}`);
      
      if (!book.id || !book.name) {
        console.warn(`Skipping book with missing required field(s): ${JSON.stringify(book)}`);
        continue;
      }
      
      try {
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
          }) RETURN b`,
          {
            id: book.id,
            name: book.name,
            author: book.author || "Unknown Author",
            lang: book.lang || "Vietnamese",
            category: book.category || "General",
            image: book.image || "",
            title: book.title || "",
            link: book.link || "",
            content: book.content || "",
            description: book.description || ""
          }
        );

        // Tạo hoặc tìm node Author và quan hệ
        await session.run(
          `MERGE (a:Author {name: $author})`,
          { author: book.author || "Unknown Author" }
        );
        await session.run(
          `MATCH (b:Book {id: $id}), (a:Author {name: $author})
           MERGE (b)-[:WRITTEN_BY]->(a)`,
          { id: book.id, author: book.author || "Unknown Author" }
        );

        // Tạo hoặc tìm node Category và quan hệ
        await session.run(
          `MERGE (c:Category {name: $category})`, 
          { category: book.category || "General" }
        );
        await session.run(
          `MATCH (b:Book {id: $id}), (c:Category {name: $category})
           MERGE (b)-[:BELONGS_TO]->(c)`,
          { id: book.id, category: book.category || "General" }
        );

        console.log(`✅ Created book '${book.name}' and linked to author '${book.author || "Unknown"}'`);
      } catch (bookError) {
        console.error(`❌ Error processing book ${book.name}:`, bookError.message);
      }
    }

    console.log('✅ Finished syncing all books with authors and categories');
  } catch (error) {
    console.error('❌ Error syncing books with authors:', error.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

syncBooksWithAuthors();
