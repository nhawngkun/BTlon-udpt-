import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import sampleBooks from './sampleBooks.js'; // Thay thế cho biến cục bộ

dotenv.config();

const driver = neo4j.driver(
  'neo4j+s://58270351.databases.neo4j.io',
  neo4j.auth.basic('neo4j', 'UlXPYheImRAqEPXhXehOLc89qRc9AKM6us2x2VJHgkY')
);

const session = driver.session();

const seedBooks = async () => {
  try {
    await session.run('MATCH (b:Book) DETACH DELETE b');
    console.log('Deleted all existing books');

    for (const book of sampleBooks) {
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
    }

    console.log('Seeded books to Neo4j successfully');
  } catch (err) {
    console.error('Error seeding books:', err.message);
  } finally {
    await session.close();
    await driver.close();
  }
};

seedBooks();
