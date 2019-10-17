import {gql} from 'apollo-server-express'

const typeDefs =  gql `
    extend type Query {
        Login(authInput: AuthInputData): AuthResponse!
        AllUsers: [User]
    }
    
    type Mutation {
        CreateUser(authInput: AuthInputData): Boolean!
        ChangeUserType(userId: String!, type: UserType!): Boolean!
        DeleteUser(userId: String, email: String): Boolean!
    }
    
    type AuthResponse {
        token: String
        isNewUser: Boolean
        userType: UserType
    }
    
    type User {
        _id: ID!
        email: String!
        type: UserType!
        profile: UserProfile
    }
    
    extend type UserProfile @key(fields: "user_id"){
        user_id: String! @external
        authorization: User
    }
    
    input AuthInputData {
        email: String!
        password: String!
    }
    
    enum UserType {
        Admin
        Owner
        Employee
        Student
        Fan
    }
       
`

export default typeDefs