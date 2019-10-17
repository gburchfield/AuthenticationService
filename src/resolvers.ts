
export const resolvers = {
    Query: {
        Login: (parent: any, {authInput}: {authInput:any}, context: any ) => {
            return context.users.loginUser({...authInput})
        },
        AllUsers: (parent: any, {loginData}: {loginData:any}, context: any ) => {
            return context.users.getAll()
        }
    },
    Mutation: {
        CreateUser: (parent: any, {authInput}: {authInput:any}, context: any) => context.users.createUser({...authInput}),
        ChangeUserRoles: (parent: any, args: any, context: any) => {
            let { userId, type } = args
            return context.users.changeUserType(userId, type)
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