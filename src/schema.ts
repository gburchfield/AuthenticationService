import {gql} from 'apollo-server-express'

const typeDefs =  gql `
    extend type Query {
        Login(loginData: LoginData): ID!
        UserID: UserID
        
    }
    
    type Mutation {
        AddUser(newUser: NewUserData): Boolean!
        ChangeUserRoles(userId: String!, roles: [Roles!]!): Boolean!
    }
    
    type UserID {
        user_id: ID!
        profile: UserProfile
    }
    
    extend type UserProfile @key(fields: "user_id"){
        user_id: String! @external
        email: String!
        roles: [Roles!]!
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