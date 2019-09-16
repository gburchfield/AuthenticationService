
export const resolvers = {
    Query: {
        Login: (parent: any, {loginData}: {loginData:any}, context: any ) => {
            return context.users.loginUser({...loginData})
        },
        UserID: (parent: any, args: any, context: any ) => {
            return context.users.getUserId()
        }
    },
    Mutation: {
        AddUser: (parent: any, {newUser}: {newUser:any}, context: any) => context.users.createUser({...newUser}),
        ChangeUserRoles: (parent: any, args: any, context: any) => {
            let { userId, roles } = args
            return context.users.addRoleToUser(userId, roles)
        }
    },
    UserID: {
        profile(userid: any) {
            return { __typename: "UserProfile", user_id: userid.user_id }
        }
    },
    UserProfile: {
        email: (_:any, __:any, context:any) => {
            console.log(_)
            console.log(context)
            return context.users.getUserEmail()
        },
        roles: (_:any, __:any, context:any) => {
            console.log(_)
            return context.users.getUserRoles()
        }
    }
}