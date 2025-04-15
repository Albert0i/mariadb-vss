// Redis
import { redisClient, disconnect } from './redis/redisClient.js'

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
  writers.forEach(async (writer, index) => {
    const { vector } = await context.getEmbeddingFor(writer.description);
    /*
      You can store or update vectors and any associated metadata in JSON using the JSON.SET command.

      To store vectors in Redis as JSON, you store the vector as a JSON array of floats. Note that this differs from vector storage in Redis hashes, which are instead stored as raw bytes.
    */
    await redisClient.call("JSON.SET", `demo:writers:${index + 1}`, 
        "$", 
        JSON.stringify({
            "id": index + 1,
            "full_name": writer.full_name,
            "notable_works": writer.notable_works,
            "description": writer.description,
            "embedding": vector
        })
    );
  })
  setTimeout( async() =>{ await disconnect() }, 5000)
}

await main()

/*
   ioredis
   https://www.npmjs.com/package/ioredis

   Using Embedding
   Finding Relevant Documents
   https://github.com/withcatai/node-llama-cpp/blob/master/docs/guide/embedding.md
*/