
export const resolvers = {
    Query: {
        User: (parent: any, {loginData}: {loginData:any}, context: any ) => context.users.loginUser({...loginData})
    },
    Mutation: {
        User: (parent: any, {newUser}: {newUser:any}, context: any) => context.users.createUser({...newUser})
    }
}