### Vector Semantic Search using MariaDB (Part 2/3)

#### Prologue 
The first instalment uncovers most of the technical details of [Vector](https://en.wikipedia.org/wiki/Vector_(mathematics_and_physics)) [Semantic Search](https://en.wikipedia.org/wiki/Semantic_search) capability regarding to a general purpose relational database, aka [MariaDB](https://mariadb.org/), and a specisl purpose [NoSQL](https://en.wikipedia.org/wiki/NoSQL) database, aka [Redis](https://redis.io/). It's to delve into coding featuring [Prisma](https://www.prisma.io/) ── an ORM supporting many popular [databases](https://www.prisma.io/docs/orm/reference/supported-databases), [node-llama-cpp](https://www.npmjs.com/package/node-llama-cpp) ── a tool to run AI models locally on local machine. 


#### I. 

#### II. 

#### III. 

#### IV. 

#### V. 

#### VI. Bibliography

#### Epilogue 

### EOF (2025/04/25)


Sure! Here's a step-by-step tutorial on using the MariaDB vector datatype and vector index with Prisma, along with sample code in Node.js using ES6 syntax.

### Step 1: Set Up Your MariaDB Database
First, ensure you have MariaDB 11.7 or later installed, as vector support is available from this version onwards.

### Step 2: Create a Table with Vector Datatype and Index
Create a table with a vector column and a vector index. You can use the following SQL commands:
```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  embedding VECTOR(1536) NOT NULL,
  VECTOR INDEX (embedding) M=8 DISTANCE=euclidean
);
```
This creates a table `products` with a vector column `embedding` and a vector index using Euclidean distance[1](https://mariadb.com/kb/en/vector-overview/)[2](https://mariadb.org/projects/mariadb-vector/).

### Step 3: Insert Data into the Table
You can insert data into the table using the `VEC_FromText` function to convert JSON arrays to vector format:
```sql
INSERT INTO products (name, description, embedding) VALUES
('Coffee Machine', 'Built to make the best coffee you can imagine', VEC_FromText('[0.3, 0.5, 0.2, 0.1]')),
('Espresso Maker', 'Perfect for espresso lovers', VEC_FromText('[0.4, 0.6, 0.3, 0.2]'));
```

### Step 4: Query the Table Using Vector Search
To perform a vector search, use the `VEC_DISTANCE_EUCLIDEAN` function:
```sql
SELECT * FROM products
ORDER BY VEC_DISTANCE_EUCLIDEAN(embedding, VEC_FromText('[0.3, 0.5, 0.1, 0.3]'))
LIMIT 10;
```

### Step 5: Set Up Your Node.js Project
Create a new Node.js project and install the necessary dependencies:
```bash
mkdir my-vector-search-app
cd my-vector-search-app
npm init -y
npm install prisma @prisma/client mariadb
```

### Step 6: Initialize Prisma
Initialize Prisma in your project:
```bash
npx prisma init --datasource-provider mysql
```
This command will create a `prisma` directory with a `schema.prisma` file and a `.env` file for environment variables.

### Step 7: Configure Your Prisma Schema
Edit the `schema.prisma` file to define your data models and configure the MariaDB connection. Here's an example schema that includes a vector field:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String
  embedding   Unsupported("vector(1536)") // Example for a 1536-dimensional vector
}
```

### Step 8: Create and Migrate the Database
Run the following commands to create and migrate your database:
```bash
npx prisma db push
```

### Step 9: Write Node.js Code Using ES6 Syntax
Here's an example of how to connect to MariaDB, insert data, and perform a vector search using ES6 syntax:
```javascript
import { PrismaClient } from '@prisma/client';
import mariadb from 'mariadb';

const prisma = new PrismaClient();
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'yourUsername',
  password: 'yourPassword',
  database: 'yourDatabase',
  connectionLimit: 5
});

async function main() {
  let conn;
  try {
    conn = await pool.getConnection();

    // Insert data
    await conn.query(`
      INSERT INTO products (name, description, embedding) VALUES
      ('Coffee Machine', 'Built to make the best coffee you can imagine', VEC_FromText('[0.3, 0.5, 0.2, 0.1]')),
      ('Espresso Maker', 'Perfect for espresso lovers', VEC_FromText('[0.4, 0.6, 0.3, 0.2]'))
    `);

    // Perform vector search
    const rows = await conn.query(`
      SELECT * FROM products
      ORDER BY VEC_DISTANCE_EUCLIDEAN(embedding, VEC_FromText('[0.3, 0.5, 0.1, 0.3]'))
      LIMIT 10
    `);

    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    if (conn) conn.end();
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
```

This code connects to the MariaDB database, inserts sample data, and performs a vector search using the `VEC_DISTANCE_EUCLIDEAN` function[1](https://mariadb.com/kb/en/vector-overview/)[2](https://mariadb.org/projects/mariadb-vector/).

Feel free to ask if you have any questions or need further assistance!

