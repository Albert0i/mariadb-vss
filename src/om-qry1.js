import { redis } from './redis/redis.js'
import { Schema, Repository, EntityId } from 'redis-om'

const writersSchema = new Schema('writers', {
        full_name: { type: 'string', sortable: true },
        notable_works: { type: 'string[]', sortable: true },
        description: { type: 'text', sortable: true }
    }, {
        dataStructure: 'JSON',
        indexName: 'demo:writers:idx_vss'
    })

await redis.connect()
const writersRepository = new Repository(writersSchema, redis)

console.log(await writersRepository.search().where('notable_works').contains('1984').return.all())

console.log(await writersRepository.search().where('description').match('political').return.all())

console.log(await writersRepository.searchRaw('@description:(A master of Gothic fiction and poetry)').return.all())

await redis.quit()