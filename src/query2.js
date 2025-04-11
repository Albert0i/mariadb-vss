import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.writers.findMany({
    where: {
          notable_works: {
              contains: "1984"
          }
    }
  })
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
   CRUD
   https://www.prisma.io/docs/orm/prisma-client/queries/crud
*/