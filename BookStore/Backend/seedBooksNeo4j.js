import fs from 'fs';
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'neo4j+s://58270351.databases.neo4j.io',
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME || 'neo4j', 
    process.env.NEO4J_PASSWORD || 'UlXPYheImRAqEPXhXehOLc89qRc9AKM6us2x2VJHgkY'
  )
);

const session = driver.session();

const exportBooksToSampleFile = async () => {
  try {
    console.log("Connecting to Neo4j database...");
    console.log(`URI: ${process.env.NEO4J_URI || 'neo4j+s://58270351.databases.neo4j.io'}`);
    
    console.log("Fetching books from Neo4j...");
    const result = await session.run('MATCH (b:Book) RETURN b');
    console.log(`Found ${result.records.length} books in database`);
    
    const books = result.records.map(record => {
      const book = record.get('b').properties;
      return {
        id: book.id,
        name: book.name,
        author: book.author,  // Đảm bảo giữ lại thông tin author
        lang: book.lang,
        category: book.category,
        image: book.image,
        title: book.title,
        link: book.link || "",
        content: book.content || "",
        description: book.description || ""
      };
    });

    const formatted = JSON.stringify(books, null, 2);
    const content = `const sampleBooks = ${formatted};\n\nexport default sampleBooks;\n`;

    fs.writeFileSync('sampleBooks.js', content, 'utf-8');
    console.log('✅ sampleBooks.js has been updated from Neo4j database');
    console.log(`Total books exported: ${books.length}`);
  } catch (err) {
    console.error('❌ Failed to export books:', err.message);
  } finally {
    await session.close();
    await driver.close();
  }
};

exportBooksToSampleFile();
