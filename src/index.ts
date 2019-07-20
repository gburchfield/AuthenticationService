import express from 'express'
import { ApolloServer} from "apollo-server-express";
import { buildFederatedSchema } from "@apollo/federation";
import { createDb } from './db'
import typeDefs from './schema'
import {resolvers} from "./resolvers";
import { Users } from "./Models/Users";
import config from "./config"

const collection = createDb('users')

collection.then( users => {
    const server = new ApolloServer({
        schema: buildFederatedSchema([{typeDefs, resolvers}]),
        context: ({req}) => {
            return {
                headers: req.headers,
                users: new Users({users})
            }
        }
    })

    const app = express()
    server.applyMiddleware({app})

    app.listen({ port: config.port }, () =>
        console.log(`🚀 Server ready at http://localhost:${config.port}${server.graphqlPath}`)
    );

} )