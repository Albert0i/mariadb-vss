// Redis
import { redisClient, disconnect } from './redis/redisClient.js'

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

// const float32Buffer = (arr) => {
//     const floatArray = new Float32Array(arr);
//     const float32Buffer = Buffer.from(floatArray.buffer);
//     return float32Buffer;
//   };

//A KNN query will give us the top n documents that best match the query vector.
/*  sample raw query

    FT.SEARCH idx:products
    "*=>[KNN 5 @productDescriptionEmbeddings $searchBlob AS score]"
    RETURN 4 score brandName productDisplayName imageURL
    SORTBY score
    PARAMS 2 searchBlob "6\xf7\..."
    DIALECT 2
*/
async function findSimilarDocuments(embedding, count = 3) {
    const { vector } = embedding
    const result = await redisClient.call('FT.SEARCH', 
                                        'demo:writers:idx_vss', 
                                        `(*) => [KNN ${count} @embedding $BLOB AS distance]`, 
                                        'RETURN', 5, 'distance', 'id', 'full_name', 'description', '$.notable_works',  
                                        'SORTBY', 'distance', 'ASC', 
                                        'PARAMS', '2', 'BLOB', 
                                                        Buffer.from(Float32Array.from(vector).buffer),
                                        'DIALECT', 2)
    return result;
  };

/*
   main
*/
console.log()
const askQuestion = () => {    
    rl.question('Input: ', async (query) => {
        const queryEmbedding = await context.getEmbeddingFor(query);
        const similarDocuments = await findSimilarDocuments(queryEmbedding);

        for (let i = 1; i < similarDocuments.length; i += 2) 
        {
            console.log(`${similarDocuments[i]}:`);
            for (let j = 0; j < 8; j += 2) {
                console.log(`   ${similarDocuments[i+1][j]}: ${similarDocuments[i+1][j+1]}`);
            }
            console.log()
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

   FT.SEARCH
   https://redis.io/docs/latest/commands/ft.search/

   Vector search
   https://redis.io/docs/latest/develop/interact/search-and-query/query/vector-search/

  FT.SEARCH index "(*)=>[KNN num_neighbours @field $vector]" PARAMS 2 vector "binary_data" DIALECT 2

  1. Pre-filter: The first expression within the round brackets is a filter. It allows you to decide which vectors should be taken into account before the vector search is performed. The expression (*) means that all vectors are considered.

  2. Next step: The => arrow indicates that the pre-filtering happens before the vector search.

  3. KNN query: The expression [KNN num_neighbours @field $vector] is a parameterized query expression. A parameter name is indicated by the $ prefix within the query string.

  4. Vector binary data: You need to use the PARAMS argument to substitute $vector with the binary representation of the vector. The value 2 indicates that PARAMS is followed by two arguments, the parameter name vector and the parameter value.

  5. Dialect: The vector search feature has been available since version two of the query dialect.
*/
