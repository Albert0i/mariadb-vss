// Prisma 
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// node-llama-cpp 
import 'dotenv/config'
import {fileURLToPath} from "url";
import path from "path";
import {getLlama} from "node-llama-cpp";

const __dirname = path.dirname(
    fileURLToPath(import.meta.url)
);

const llama = await getLlama();
const model = await llama.loadModel({
    modelPath: path.join(__dirname, "..", "src", "models", "paraphrase-MiniLM-L6-v2.i1-IQ1_S.gguf")
});
const context = await model.createEmbeddingContext();

// The writers data 
import writers from "../data/writers.json" with { type: "json" };

/*
   main
*/
async function main() {
  for (const writer of writers) {
    let { vector } = await context.getEmbeddingFor(writer.description);

    await prisma.$executeRaw`
        INSERT INTO writers (full_name, notable_works, description, embedding) 
        VALUES( ${writer.full_name}, 
                ${JSON.stringify(writer.notable_works)}, 
                ${writer.description}, 
                VEC_FromText(${JSON.stringify(vector)})
              );
    `; 
  }
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

   Using Embedding
   Finding Relevant Documents
   https://github.com/withcatai/node-llama-cpp/blob/master/docs/guide/embedding.md
*/