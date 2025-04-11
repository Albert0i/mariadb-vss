import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`
            SELECT VEC_DISTANCE_COSINE(
                                        embedding,
                                        (VEC_FromText('[0.22, 0.21, 0.23, 0.24, 0.25]'))
                                    ) AS distance,
                id, full_name, description
            FROM writers 
            ORDER BY 1 
            LIMIT 3;
  `; 
  console.log('result = ', result)
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