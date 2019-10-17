import {Collection, ObjectId} from 'mongodb'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from "../config"
import { AuthenticationError } from 'apollo-server-express'
import redis, {RedisClient} from 'redis'
import {ServiceDataModel} from "socialbrokernode";

export class Users extends ServiceDataModel implements UsersInterface{
    private EventBus: RedisClient = redis.createClient('redis://redis')

    constructor(user: string, collection: Collection ){
        super(user, collection)
    }

    private isAllowed( types: [UserType?] = [], self: string = null ): void {
        types.push(UserType.Admin)
        let allowed = false
        if(!this._user){
            throw new AuthenticationError('Not Authenticated')
        }
        types.forEach(type => {
            allowed = allowed || type === this._user.userType
        })
        if(self){
            allowed = self === this._user._id.toString()
        }
        if(!allowed){
            throw new AuthenticationError('Not Allowed')
        }
    }

    async getUser(id: string) : Promise<any> {
        this.isAllowed([], id)
        let _id = new ObjectId(id)
        let user = await this._collection.findOne({ _id: _id }, { projection: { password: 0 } })
        return user
    }

    async getAll() : Promise<any> {
        this.isAllowed()
        let users = await this._collection.find({}, { projection: { password: 0 } }).toArray()
        return users
    }

    async deleteUser( args: any ) : Promise<boolean> {
        this.isAllowed()
        let { id, email } = args
        let query, userDeleted
        if(id){
            query = { _id: new ObjectId(id) }
        }
        if(email){
            query = {  email: email  }
        }

        let result = await this._collection.findOneAndDelete(query)
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

    async loginUser({ email, password }: AuthInput): Promise<AuthResponse> {
        let user = await this._collection.findOne({email})

        if(user){
            console.log(user)
            // User bcrypt to compare password
            let res = bcrypt.compareSync(password, user.password)
            if(res){
                let tokenData: TokenData = {
                    _id: user._id.toString(),
                    email: user.email,  //TODO DO I EVEN NEED THIS SHIT HERE
                    userType: user.type
                }
                let token: string = jwt.sign(JSON.stringify(tokenData), config.secret)
                let output: any = {
                    token,
                    isNewUser: user.isNew || false,
                    userType: user.type
                }
                console.log(output)
                return  output
            } else {
                throw new Error('Authentication Invalid')
            }
        } else {
            throw new Error('Authentication Invalid')
        }
    }

    async createUser({email, password}: AuthInput): Promise<Boolean> {
        let salt = bcrypt.genSaltSync(10)
        let dbPassword = bcrypt.hashSync(password, salt)
        let existingUser = await this._collection.findOne({email:email})
        if(!existingUser){
            let newUser = await this._collection.insertOne({email, password: dbPassword, type: UserType.Fan, isVerified: false, isNew: true})
            //TODO Need to kick off verification of email somehow here
            return !!newUser.result.ok
        } else {
            throw new Error('User already exists')
        }
    }

    async changeUserType(userId: string, type: UserType): Promise<any> {
        this.isAllowed([UserType.Owner])
        const id = new ObjectId(userId)
        const updatedUser = await this._collection.findOneAndUpdate({_id:id},{ $set: { type: type } }, { returnOriginal: false })
        return !!updatedUser.ok
    }

}

export interface UsersInterface {
    getUser: (id: string) => Promise<any>,
    getAll: () => Promise<any>,
    deleteUser: (args:any) => Promise<boolean>,
    loginUser: ( { email, password }: AuthInput ) => Promise<AuthResponse>,
    createUser: ( {email, password}: AuthInput ) => Promise<Boolean>,
    changeUserType: ( userId: string, type: UserType ) => Promise<any>
}

interface AuthInput {
    email: string,
    password: string
}

interface AuthResponse {
    token?: string;
    isNewUser?: boolean;
    userType?: UserType;
}

interface TokenData {
    _id: string,
    email: string,
    userType: UserType
}

enum UserType {
    Admin = 'Admin',
    Owner = 'Owner',
    Employee = 'Employee',
    Student = 'Student',
    Fan = 'Fan',
    Self = 'Self'
}