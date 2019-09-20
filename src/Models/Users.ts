import { Collection, ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from "../config"
import { AuthenticationError } from 'apollo-server-express'
import redis, {RedisClient} from 'redis'

export class Users {
    private collection: Collection
    private user: any
    private EventBus: RedisClient = redis.createClient('redis://redis')

    constructor(args: any){
        let { users, headers } = args
        this.collection = users
        this.user = (headers.user) ? JSON.parse(headers.user) : false
        if(this.user) {
            this.user._id = new ObjectId(this.user._id)
        }
    }

    private isAllowed(role: string = Roles.Basic): void {
        if(!this.user){
            throw new AuthenticationError('Not Authenticated')
        }
        if(role === Roles.Admin && !this.user.roles.includes(Roles.Admin)){
            throw new AuthenticationError('Not Allowed')
        }
    }

    async getUser(id: string) : Promise<any> {
        this.isAllowed()
        let user = await this.collection.findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } })
        return user
    }

    async getAll() : Promise<any> {
        this.isAllowed(Roles.Admin)
        let users = await this.collection.find({}, { projection: { password: 0 } }).toArray()
        return users
    }

    async deleteUser( args: any ) : Promise<boolean> {
        this.isAllowed(Roles.Admin)
        let { id, email } = args
        let query, userDeleted
        if(id){
            query = { _id: new ObjectId(id) }
        }
        if(email){
            query = {  email: email  }
        }

        let result = await this.collection.findOneAndDelete(query)
        if(result.ok && result.value){
            userDeleted = true
            // Send Message to Queue to tell other services to delete this user if the delete is successful here
            let deletedUser = result.value
            let msg: any = {
                action: 'DELETE_USER',
                id: deletedUser._id.toString()
            }
            msg = JSON.stringify(msg)
            console.log(deletedUser, msg)
            this.EventBus.publish("USER_DATA", msg)
        } else {
            userDeleted = false
        }
        return userDeleted
    }

    async loginUser({ email, username, password }: LoginUserInput): Promise<string> {
        let user
        if(email){
            user = await this.collection.findOne({email})
        } else if (username){
            user = await this.collection.findOne({username})
        }

        if(user){
            // User bcrypt to compare password
            let res = bcrypt.compareSync(password, user.password)
            if(res){
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
        if(!this.user.roles.includes(Roles.Admin)){
            throw new AuthenticationError('Not Allowed')
        }
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