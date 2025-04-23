### Tutorial on Using Redis-OM in Node.js

Let's create a step-by-step tutorial on using Redis-OM in Node.js with ES6 import syntax, incorporating the given object model.

#### Step 1: Set Up Your Project

1. **Initialize a new Node.js project**:
    ```bash
    mkdir redis-om-tutorial
    cd redis-om-tutorial
    npm init -y
    ```

2. **Install necessary dependencies**:
    ```bash
    npm install express redis redis-om dotenv
    ```

3. **Configure ES6 modules**:
    In your `package.json`, add `"type": "module"`:
    ```json
    {
      "name": "redis-om-tutorial",
      "version": "1.0.0",
      "main": "index.js",
      "type": "module",
      "scripts": {
        "start": "node index.js"
      },
      "dependencies": {
        "express": "^4.17.1",
        "redis": "^4.0.0",
        "redis-om": "^0.1.0",
        "dotenv": "^10.0.0"
      }
    }
    ```

#### Step 2: Set Up Redis

1. **Run Redis Stack**:
    You can run Redis Stack using Docker:
    ```bash
    docker run -p 6379:6379 redis/redis-stack:latest
    ```

#### Step 3: Create Your Application

1. **Create a `.env` file**:
    ```env
    REDIS_URL=redis://localhost:6379
    ```

2. **Create `index.js`**:
    ```javascript
    import 'dotenv/config';
    import express from 'express';
    import { Client } from 'redis-om';

    const app = express();
    app.use(express.json());

    const client = new Client();
    await client.open(process.env.REDIS_URL);

    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
    ```

#### Step 4: Define a Schema and Repository

1. **Create `schema.js`**:
    ```javascript
    import { Entity, Schema } from 'redis-om';

    class Author extends Entity {}
    
    const authorSchema = new Schema(Author, {
      full_name: { type: 'string' },
      notable_works: { type: 'string[]' },
      description: { type: 'string' }
    });

    export { authorSchema };
    ```

2. **Create `repository.js`**:
    ```javascript
    import { Repository } from 'redis-om';
    import { client } from './index.js';
    import { authorSchema } from './schema.js';

    const authorRepository = new Repository(authorSchema, client);

    export { authorRepository };
    ```

#### Step 5: Create Routes

1. **Create `routes.js`**:
    ```javascript
    import express from 'express';
    import { authorRepository } from './repository.js';

    const router = express.Router();

    router.post('/author', async (req, res) => {
      const author = authorRepository.createEntity(req.body);
      const id = await authorRepository.save(author);
      res.send({ id });
    });

    router.get('/author/:id', async (req, res) => {
      const author = await authorRepository.fetch(req.params.id);
      res.send(author);
    });

    export default router;
    ```

2. **Update `index.js` to use the routes**:
    ```javascript
    import router from './routes.js';

    app.use('/api', router);
    ```

#### Step 6: Run Your Application

1. **Start your server**:
    ```bash
    npm start
    ```

2. **Test your API**:
    You can use tools like Postman or curl to test your API endpoints.

And that's it! You've set up a basic Node.js application using Redis-OM with ES6 import syntax, incorporating the given object model. If you have any questions or need further assistance, feel free to ask! 😊

