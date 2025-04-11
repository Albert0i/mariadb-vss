import 'dotenv/config'
import { runSelectSQL, runSQL } from './util/yrunner.js'

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

await runSQL([
                `ALTER SESSION SET current_schema = ${process.env.NODE_ORACLEDB_USER}`
            ])

async function findSimilarDocuments(embedding, count = 10) {
    const { vector } = embedding

    const result = await runSelectSQL(`SELECT id, document, 
                                              cosine_similarity(float_array_384(${vector}), embedding) AS score 
                                       FROM vec_items
                                       ORDER BY score DESC  
                                       OFFSET 0 ROWS FETCH NEXT ${count} ROWS ONLY
                                     `)
    if (result.success)
        return result.rows;
    else {
        console.log(result)
        return []
    } 
}

/*
   main
*/
console.log()
const askQuestion = () => {    
    rl.question('Input: ', async (query) => {
        const queryEmbedding = await context.getEmbeddingFor(query);
        const similarDocuments = await findSimilarDocuments(queryEmbedding);
        
        for (let i = 0; i < similarDocuments.length; i++) {
            console.log(`Element[${i+1}]: ${similarDocuments[i].DOCUMENT}, ${similarDocuments[i].SCORE}`);
        }
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

/*
CREATE OR REPLACE FUNCTION cosine_similarity(
  array1 IN float_array_384,
  array2 IN float_array_384
) RETURN BINARY_FLOAT IS
  dot_product BINARY_FLOAT := 0;
  norm_a BINARY_FLOAT := 0;
  norm_b BINARY_FLOAT := 0;
  similarity BINARY_FLOAT;
BEGIN
  IF array1.COUNT != array2.COUNT THEN
    RAISE_APPLICATION_ERROR(-20001, 'Arrays must be of the same length');
  END IF;

  FOR i IN 1 .. array1.COUNT LOOP
    dot_product := dot_product + (array1(i) * array2(i));
    norm_a := norm_a + (array1(i) * array1(i));
    norm_b := norm_b + (array2(i) * array2(i));
  END LOOP;

  IF norm_a = 0 OR norm_b = 0 THEN
    RETURN 0;
  ELSE
    similarity := dot_product / (SQRT(norm_a) * SQRT(norm_b));
    RETURN similarity;
  END IF;
END cosine_similarity;

*/