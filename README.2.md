### Vector Semantic Search using MariaDB (Part 2/3)

#### Prologue 
The first instalment uncovers most of the technical details of [Vector](https://en.wikipedia.org/wiki/Vector_(mathematics_and_physics)) [Semantic Search](https://en.wikipedia.org/wiki/Semantic_search) capability regarding to a general purpose relational database, aka [MariaDB](https://mariadb.org/), and a specisl purpose [NoSQL](https://en.wikipedia.org/wiki/NoSQL) database, aka [Redis](https://redis.io/). It's time to delve into the [code](https://code.visualstudio.com/) featuring [Prisma](https://www.prisma.io/) ─ an [ORM](https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping) supporting many popular [databases](https://www.prisma.io/docs/orm/reference/supported-databases), [node-llama-cpp](https://www.npmjs.com/package/node-llama-cpp) ─ a tool to run AI models locally on local machine to test drive the new search power. 


#### I. The SQL way 
To begin with, our data model is like this: 
```
  {
    "full_name": "Agatha Christie",
    "notable_works": [
                      "The Murder of Roger Ackroyd",
                      "The Mysterious Affair at Styles",
                      "The A.B.C. Murders",
                      "Curtain: Poirot's Last Case"
                     ],
    "description": "The queen of mystery novels with ingenious plots."
  }
```

According to *canonical* RDBMS design principle, the first step is to *normalize* the `writers` table by splitting the `notable_works` into separate table, but we are going to store array of string using JSON datatype here: 
```
CREATE OR REPLACE TABLE writers (
    id        INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(128),
    notable_works JSON, 
    description TEXT, 
    
    embedding VECTOR(5) NOT NULL) 
ENGINE=InnoDB;

CREATE OR REPLACE FULLTEXT INDEX idx_writers_fts ON writers(description); 
CREATE OR REPLACE VECTOR INDEX idx_writers_vss ON writers(embedding) M=8 DISTANCE=cosine; 
```

We create `writers` table, fulltext index `idx_writers_fts` and vector index `idx_writers_vss`. The next step is to insert testing data: 
```
-- 1 William Shakespeare
INSERT INTO writers (full_name, notable_works, description, embedding) 
VALUES( 'William Shakespeare', 
        '["Hamlet", "Romeo and Juliet"]', 
        'The most celebrated playwright in history, known for his tragedies and comedies.',
        VEC_FromText('[0.11, 0.21, 0.31, 0.41, 0.51]')
      );
-- 2 Jane Austen
INSERT INTO writers (full_name, notable_works, description, embedding) 
VALUES( 'Jane Austen', 
        '["Pride and Prejudice", "Sense and Sensibility"]', 
        'Renowned for her sharp observations of 19th-century society and romance.',
        VEC_FromText('[0.21, 0.22, 0.23, 0.24, 0.25]')
      );
-- 3 Charles Dickens
INSERT INTO writers (full_name, notable_works, description, embedding) 
VALUES( 'Charles Dickens', 
        '["A Tale of Two Cities", "The Mystery of Edwin Drood"]', 
        'A Victorian novelist celebrated for his social commentary and vivid characters.',
        VEC_FromText('[0.31, 0.32, 0.33, 0.34, 0.35]')
      );
-- 4 George Orwell
INSERT INTO writers (full_name, notable_works, description, embedding) 
VALUES( 'George Orwell', 
        '["1984", "Animal Farm"]', 
        'Known for his dystopian novels critiquing political oppression.',
        VEC_FromText('[0.41, 0.42, 0.43, 0.44, 0.45]')
      );
-- 5 Virginia Woolf
INSERT INTO writers (full_name, notable_works, description, embedding) 
VALUES( 'Virginia Woolf', 
        '["Mrs. Dalloway"]', 
        'A modernist pioneer exploring identity and consciousness.',
        VEC_FromText('[0.51, 0.52, 0.53, 0.54, 0.55]')
      );
```

By means of `VEC_FromText`, we create some *fake* vectors and play with SELECT statement: 
```
SELECT VEC_DISTANCE_COSINE(
	(SELECT embedding FROM writers WHERE id=1),
	(VEC_FromText('[0.21, 0.22, 0.23, 0.24, 0.25]'))
);

SELECT VEC_DISTANCE_COSINE(
                            embedding,
                            (VEC_FromText('[0.22, 0.21, 0.23, 0.24, 0.25]'))
                          ),
       id, full_name, description
FROM writers 
ORDER BY 1 
LIMIT 3;
```

By the way, JSON data can be queried like this: 
```
SELECT * FROM writers WHERE JSON_CONTAINS(notable_works, '"1984"');
```

Fulltext search can be queried like this: 
```
SELECT * FROM writers WHERE MATCH(description) AGAINST('political');
```


#### II. The ORM way 
Not all database functions and features of [Prisma ORM](https://www.prisma.io/docs/orm/prisma-schema/data-model/unsupported-database-features)'s supported databases have a Prisma Schema Language equivalent. As of this writing, VECTOR datatype is one of them. Let start by installing the packages: 
```
npm install prisma --save-dev
npm install @prisma/client mariadb
```

Initialize prisma: 
```
npx prisma init
```

Setup `DATABASE_URL` in `.env`: 
```
DATABASE_URL="mysql://username:password@localhost:3306/test"
```

In `schema.prisma`, change provider to `mysql`: 
```
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

Pull the model out of database via introspection: 
```
npx prisma db pull 
```

Check `schema.prisma`:
```
model writers {
  id            Int                      @id @default(autoincrement())
  full_name     String?                  @db.VarChar(128)
  notable_works String?                  @db.LongText
  description   String?                  @db.Text
  embedding     Unsupported("vector(5)")

  @@index([embedding], map: "idx_writers_vss")
  @@fulltext([description], map: "idx_writers_fts")
}
```

Generate client code for the model: 
```
npx prisma generate
```

Add a fragment to `package.json`: 
```
"prisma": {
  "seed": "node prisma/seed.js"
},
```

Create `prisma/seed.js`, empty the `writers` table and to seed the database with: 
```
npx prisma db seed 
```
![alt prisma-db-seed](img/prisma-db-seed.JPG)


#### III. 

#### IV. 

#### V. 

[Continue to Part 3](README.3.md)
canonical

#### VI. Bibliography
1. ["The Myth and Riddle of ORM"](https://github.com/Albert0i/prisma-planetscale/blob/main/ORM.md)
2. [JSON Data Type](https://mariadb.com/kb/en/json/)
3. [Full-Text Indexes](https://mariadb.com/kb/en/full-text-indexes/)
4. [MySQL/MariaDB](https://www.prisma.io/docs/orm/overview/databases/mysql)
5. [Seeding](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding)
6. [CRUD](https://www.prisma.io/docs/orm/prisma-client/queries/crud)
7. [Full-text search](https://www.prisma.io/docs/orm/prisma-client/queries/full-text-search)
8. [Raw queries](https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries)
9. [Prisma Client API reference](https://www.prisma.io/docs/orm/reference/prisma-client-reference)
10. [The Trial by Franz Kafka](https://www.gutenberg.org/cache/epub/7849/pg7849-images.html)


#### Epilogue 

### EOF (2025/04/25)
