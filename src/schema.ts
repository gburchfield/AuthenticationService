import {gql} from 'apollo-server-express'

const typeDefs =  gql `
    type Query {
        User(loginData: LoginData): User!
    }
    
    input LoginData {
        email: String
        username: String
        password: String!
    }
    
    type User {
        email: String!
        username: String!
        token: ID
    }
    
    type Mutation {
        User(newUser: NewUserData): User!
    }
    
    input NewUserData {
        email: String!
        username: String!
        password: String!
    }   
`

export default typeDefs