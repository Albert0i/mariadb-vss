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
    //const embeddings = Buffer.from(Float32Array.from(vector).buffer)

    await redisClient.call("JSON.SET", `demo:writers:${index + 1}`, 
        "$", 
        JSON.stringify(`{
            "id": ${index + 1}
            "full_name": ${writer.full_name},
            "notable_works": ${JSON.stringify(writer.notable_works)},
            "description": ${writer.description},
            "embedding": ${JSON.stringify(vector)}
        }`)
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