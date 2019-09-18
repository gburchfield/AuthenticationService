
export const resolvers = {
    Query: {
        Login: (parent: any, {loginData}: {loginData:any}, context: any ) => {
            return context.users.loginUser({...loginData})
        },
        AllUsers: (parent: any, {loginData}: {loginData:any}, context: any ) => {
            return context.users.getAll()
        }
    },
    Mutation: {
        CreateUser: (parent: any, {newUser}: {newUser:any}, context: any) => context.users.createUser({...newUser}),
        ChangeUserRoles: (parent: any, args: any, context: any) => {
            let { userId, roles } = args
            return context.users.addRoleToUser(userId, roles)
        },
        DeleteUser: (parent: any, args: any, context: any) => {
            let { userId, email } = args
            return context.users.deleteUser({id: userId, email})
        }
    },
    UserProfile: {
        authorization: (parent:any, __:any, context:any) => {
            return context.users.getUser(parent.user_id)
        }
    },
    User: {
        profile: (parent:any, __:any, context:any) => {
            console.log(parent)
            return { __typename: "UserProfile", user_id: parent._id }
        }
    }
}