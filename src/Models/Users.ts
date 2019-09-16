import { Collection, ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from "../config"
import { AuthenticationError } from 'apollo-server-express'

export class Users {
    private collection: Collection
    private user: any

    constructor(args: any){
        let { users, headers } = args
        this.collection = users
        this.user = (headers.user) ? JSON.parse(headers.user) : false
        if(this.user) {
            this.user._id = new ObjectId(this.user._id)
        }
    }

    getUserId() : string {
        if(!this.user){
            throw new AuthenticationError('Not Authenticated')
        }
        return this.user._id.toString()
    }

    getUserEmail() : string {
        if(!this.user){
            throw new AuthenticationError('Not Authenticated')
        }
        return this.user.email
    }

    getUserRoles() : [Roles] {
        if(!this.user){
            throw new AuthenticationError('Not Authenticated')
        }
        return this.user.roles
    }

    async loginUser({ email, username, password }: LoginUserInput): Promise<string> {
        let user
        if(email){
            user = await this.collection.findOne({email})
        } else if (username){
            user = await this.collection.findOne({username})
        } else {
            throw new Error('Authentication Invalid')
        }

        // User bcrypt to compare password
        let res = bcrypt.compareSync(password, user.password)
        if(res){
            console.log(user)
            let tokenData: TokenData = {
                _id: user._id.toString(),
                email: user.email,
                roles: user.roles
            }
            let token: string = jwt.sign(JSON.stringify(tokenData), config.secret)
            return token
        } else {
            throw new Error('Authentication Invalid')
        }
    }

    async createUser({email, password}: CreateUserInput): Promise<any> {
        let salt = bcrypt.genSaltSync(10)
        let dbPassword = bcrypt.hashSync(password, salt)
        let existingUser = await this.collection.findOne({email:email})
        if(!existingUser){
            let newUser = await this.collection.insertOne({email, password: dbPassword, roles:[Roles.Basic]})
            // Need to kick off verification of email somehow here
            return !!newUser.result.ok
        } else {
            throw new Error('User already exists')
        }
    }

    async addRoleToUser(userId: string, roles: Roles): Promise<any> {
        if(!this.user){
            throw new AuthenticationError('Not Authenticated')
        }
        // if(!this.user.roles.inclues(Roles.Admin)){
        //     throw new AuthenticationError('Not Authorized')
        // }
        const id = new ObjectId(userId)
        try {
            const updatedUser = await this.collection.findOneAndUpdate({_id:id},{ $set: { roles: roles } }, { returnOriginal: false })
            return !!updatedUser.ok
        } catch (e) {
            console.log(e)
            throw e
        }
    }

}

interface LoginUserInput {
    email?: string,
    username?: string,
    password: string
}

interface CreateUserInput {
    email: string,
    password: string
}

interface TokenData {
    _id: string,
    email: string,
    roles: [Roles]
}

enum Roles {
    Admin = 'Admin',
    Premium = 'Premium',
    Basic = 'Basic'
}