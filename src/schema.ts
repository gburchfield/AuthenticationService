import {gql} from 'apollo-server-express'

const typeDefs =  gql `
    extend type Query {
        Login(loginData: LoginData): ID!
        AllUsers: [User]
    }
    
    type Mutation {
        CreateUser(newUser: NewUserData): Boolean!
        ChangeUserRoles(userId: String!, roles: [Roles!]!): Boolean!
        DeleteUser(userId: String, email: String): Boolean!
    }
    
    type User {
        _id: ID
        email: String
        username: String
        roles: [Roles]
        profile: UserProfile
    }
    
    extend type UserProfile @key(fields: "user_id"){
        user_id: String! @external
        authorization: User
    }
    
    input LoginData {
        email: String
        username: String
        password: String!
    }
    
    input NewUserData {
        email: String!
        password: String!
    }
    
    enum Roles {
        Admin
        Premium
        Basic
    }
       
`

export default typeDefs