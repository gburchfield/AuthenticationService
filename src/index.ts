import {ServiceNodeConfig} from "socialbrokernode/dist/lib/Types";
import {Users, UsersInterface} from "./Models/Users";
import typeDefs from './schema'
import {resolvers} from "./resolvers";
import {ServiceNode} from "socialbrokernode";
import dotenv from 'dotenv'
dotenv.config()


let config: ServiceNodeConfig<UsersInterface> = {
    port: process.env.PORT,
    secret: process.env.SECRET_KEY,
    database_config: {
        cluster_uri: `${process.env.MONGODB_URL}:${process.env.MONGODB_PORT}/${process.env.DB_NAME}`,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    },
    typeDefs: typeDefs,
    resolvers: resolvers,
    collection: {
        name: 'users',
        model: Users
    }
}

let AuthenticationService: ServiceNode<UsersInterface> = new ServiceNode<UsersInterface>(config)

AuthenticationService.buildServiceServer().then(() =>{
    AuthenticationService.start()
}).catch(e => {
    console.log(e)
})