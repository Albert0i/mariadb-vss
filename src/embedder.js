import 'dotenv/config'
import { runSelectSQL, runSQL } from './util/yrunner.js'

import {fileURLToPath} from "url";
import path from "path";
import {getLlama} from "node-llama-cpp";

const __dirname = path.dirname(
    fileURLToPath(import.meta.url)
);

const llama = await getLlama();
const model = await llama.loadModel({
    modelPath: path.join(__dirname, "models", "paraphrase-MiniLM-L6-v2.i1-IQ1_S.gguf")
});
const context = await model.createEmbeddingContext();

async function embedDocuments(id, document) {
    const { vector } = await context.getEmbeddingFor(document);
    const updateStmt = `UPDATE vec_items 
                        SET embedding = float_array_384(${vector}) 
                        WHERE id = ${id}`
    await runSQL([updateStmt])
}

/*
   main 
*/
const batchSize = 1000
let batchNumber = 1
let result = null; 
await runSQL([
    `ALTER SESSION SET current_schema = ${process.env.NODE_ORACLEDB_USER}`
])

console.log(`Starting processing, batch size is ${batchSize}.`)
do {
    console.log(`Batch number ${batchNumber}`)
    result = await runSelectSQL(`
                    SELECT id, document FROM vec_items 
                    ORDER BY id ASC 
                    OFFSET ${(batchNumber -1) * batchSize} ROWS 
                    FETCH NEXT ${batchSize} ROWS ONLY
        `)        
    if (result.success)
        result.rows.forEach(async (row) => {
            //console.log(`${row.ID}, ${row.DOCUMENT}`)
            await embedDocuments(row.ID, row.DOCUMENT)
        })
    batchNumber++; 
} while (result.rows.length > 0);
console.log('Done! Better wait a little while...')

/*
   Using Embedding
   Finding Relevant Documents
   https://github.com/withcatai/node-llama-cpp/blob/master/docs/guide/embedding.md
*/