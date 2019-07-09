import { MongoClient } from 'mongodb'
import config from "./config"

const uri = config.cluster_uri;

export async function createDb (collection: string) {
    let client = await MongoClient.connect(uri, {useNewUrlParser: true, auth:{user:config.db_user, password: config.db_password}})
    let database = await client.db(config.db_name)
    let col = await database.collection(collection)
    return col
}