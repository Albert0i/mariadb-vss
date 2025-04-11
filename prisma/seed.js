import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1 William Shakespeare
  await prisma.$executeRaw`
      INSERT INTO writers (full_name, notable_works, description, embedding) 
      VALUES( 'William Shakespeare', 
              '["Hamlet", "Romeo and Juliet"]', 
              'The most celebrated playwright in history, known for his tragedies and comedies.',
              VEC_FromText('[0.11, 0.21, 0.31, 0.41, 0.51]')
            );
  `; 
  // 2 Jane Austen
  await prisma.$executeRaw`
      INSERT INTO writers (full_name, notable_works, description, embedding) 
      VALUES( 'Jane Austen', 
              '["Pride and Prejudice", "Sense and Sensibility"]', 
              'Renowned for her sharp observations of 19th-century society and romance.',
              VEC_FromText('[0.21, 0.22, 0.23, 0.24, 0.25]')
            );
  `;
  // 3 Charles Dickens
  await prisma.$executeRaw`
      INSERT INTO writers (full_name, notable_works, description, embedding) 
      VALUES( 'Charles Dickens', 
              '["A Tale of Two Cities", "The Mystery of Edwin Drood"]', 
              'A Victorian novelist celebrated for his social commentary and vivid characters.',
              VEC_FromText('[0.31, 0.32, 0.33, 0.34, 0.35]')
            );
  `; 
  // 4 George Orwell
  await prisma.$executeRaw`
      INSERT INTO writers (full_name, notable_works, description, embedding) 
      VALUES( 'George Orwell', 
              '["1984", "Animal Farm"]', 
              'Known for his dystopian novels critiquing political oppression.',
              VEC_FromText('[0.41, 0.42, 0.43, 0.44, 0.45]')
            );
  `;   
  // 5 Virginia Woolf
  await prisma.$executeRaw`
      INSERT INTO writers (full_name, notable_works, description, embedding) 
      VALUES( 'Virginia Woolf', 
              '["Mrs. Dalloway"]', 
              'A modernist pioneer exploring identity and consciousness.',
              VEC_FromText('[0.51, 0.52, 0.53, 0.54, 0.55]')
            );
  `; 
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

/*
   Raw queries
   https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries
*/