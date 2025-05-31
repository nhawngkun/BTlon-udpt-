import fs from 'fs';
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const driver = neo4j.driver(
  'neo4j+s://58270351.databases.neo4j.io',
  neo4j.auth.basic('neo4j', 'UlXPYheImRAqEPXhXehOLc89qRc9AKM6us2x2VJHgkY')
);

const session = driver.session();

const exportBooksToSampleFile = async () => {
  try {
    const result = await session.run('MATCH (b:Book) RETURN b');
    const books = result.records.map(record => {
      const book = record.get('b').properties;
      return {
        id: book.id,
        name: book.name,
        author: book.author,
        lang: book.lang,
        category: book.category,
        image: book.image,
        title: book.title,
        link: book.link,
        content: book.content,
        description: book.description
      };
    });

    const formatted = JSON.stringify(books, null, 2);
    const content = `const sampleBooks = ${formatted};\n\nexport default sampleBooks;\n`;

    fs.writeFileSync('sampleBooks.js', content, 'utf-8');
    console.log('✅ sampleBooks.js has been updated from Neo4j database');
  } catch (err) {
    console.error('❌ Failed to export books:', err.message);
  } finally {
    await session.close();
    await driver.close();
  }
};

exportBooksToSampleFile();
