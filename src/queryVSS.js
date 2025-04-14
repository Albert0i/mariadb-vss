// Prisma 
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// node-llama-cpp 
import 'dotenv/config'
import {fileURLToPath} from "url";
import path from "path";
import {getLlama} from "node-llama-cpp";

import readline from 'readline';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const __dirname = path.dirname(
    fileURLToPath(import.meta.url)
);

const llama = await getLlama();
const model = await llama.loadModel({
    modelPath: path.join(__dirname, "models", "paraphrase-MiniLM-L6-v2.i1-IQ1_S.gguf")
});
const context = await model.createEmbeddingContext();

async function findSimilarDocuments(embedding, count = 3) {
    const { vector } = embedding

    const result = await prisma.$queryRaw`
                          SELECT VEC_DISTANCE_COSINE(
                                   embedding,
                                   VEC_FromText(${JSON.stringify(vector)})
                                 ) AS distance,
                                 id, full_name, description, notable_works
                          FROM writers 
                          ORDER BY 1 
                          LIMIT ${count} OFFSET 0 ;
                        `; 
    return result 
}

/*
   main
*/
console.log()
const askQuestion = () => {    
    rl.question('Input: ', async (query) => {
        const queryEmbedding = await context.getEmbeddingFor(query);
        const similarDocuments = await findSimilarDocuments(queryEmbedding);

        similarDocuments.forEach((doc, i) => {
            console.log(`Element[${i}]:`);
            console.log(`   distance=${doc.distance}`);
            console.log(`   description=${doc.description}`);
            console.log(`   full_name=${doc.full_name}`);
            console.log(`   notable_works=${doc.notable_works}`);
            console.log()
        });
        console.log()
        askQuestion(); // Recurse to ask the question again
    });
};

askQuestion();

/*
   Using Embedding
   Finding Relevant Documents
   https://github.com/withcatai/node-llama-cpp/blob/master/docs/guide/embedding.md
*/
