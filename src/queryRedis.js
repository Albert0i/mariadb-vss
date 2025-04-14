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

const float32Buffer = (arr) => {
    const floatArray = new Float32Array(arr);
    const float32Buffer = Buffer.from(floatArray.buffer);
    return float32Buffer;
  };

//A KNN query will give us the top n documents that best match the query vector.
/*  sample raw query

    FT.SEARCH idx:products
    "*=>[KNN 5 @productDescriptionEmbeddings $searchBlob AS score]"
    RETURN 4 score brandName productDisplayName imageURL
    SORTBY score
    PARAMS 2 searchBlob "6\xf7\..."
    DIALECT 2
*/
// async function findSimilarDocuments(embedding, count = 3) {
//     const { vector } = embedding

//     const result = await prisma.$queryRaw`
//                           SELECT VEC_DISTANCE_COSINE(
//                                    embedding,
//                                    VEC_FromText(${JSON.stringify(vector)})
//                                  ) AS distance,
//                                  id, full_name, description, notable_works
//                           FROM writers 
//                           ORDER BY 1 
//                           LIMIT ${count} OFFSET 0 ;
//                         `; 
//     return result 
// }
async function findSimilarDocuments(embedding, count = 3) {
    const { vector } = embedding

    const searchQuery = `(*)=>[KNN ${count} @embeddings $searchBlob AS score]`;
  
    const results = await redisClient.call('FT.SEARCH', 
                                       'demo:writers:idx_vss', 
                                       searchQuery, 
                                       'RETURN', 5, 'score', 'id', 'full_name', 'description', 'notable_works', 
                                       'SORTBY', 'score', 'ASC', 
                                       'PARAMS', 2, 'searchBlob', 
                                                    float32Buffer(vector), 
                                       'DIALECT', 2);
    
    return results;
  };

/*
   main
*/
console.log()
const askQuestion = () => {    
    rl.question('Input: ', async (query) => {
        const queryEmbedding = await context.getEmbeddingFor(query);
        const similarDocuments = await findSimilarDocuments(queryEmbedding);

        console.log(similarDocuments)
        // similarDocuments.forEach((doc, i) => {
        //     console.log(`Element[${i}]:`);
        //     console.log(`   distance=${doc.distance}`);
        //     console.log(`   description=${doc.description}`);
        //     console.log(`   full_name=${doc.full_name}`);
        //     console.log(`   notable_works=${doc.notable_works}`);
        //     console.log()
        // });
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
