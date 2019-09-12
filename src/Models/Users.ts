import { Collection, ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from "../config"

export class Users {
    private collection: Collection
    private user: any

    constructor(args: any){
        let { users } = args
        this.collection = users
    }

    async loginUser({ email, username, password }: LoginUserInput): Promise<any> {
        if(email){
            this.user = await this.collection.findOne({email})
        } else if (username){
            this.user = await this.collection.findOne({username})
        } else {
            throw new Error('Authentication Invalid')
        }

        // User bcrypt to compare password
        let res = bcrypt.compareSync(password, this.user.password)
        if(res){
            let userOutput: UserOuput = {
                _id: this.user._id.toString(),
                email: this.user.email,
                username: this.user.username
            }
            let token: string = jwt.sign(userOutput, config.secret)
            userOutput.token = token
            return userOutput
        } else {
            throw new Error('Authentication Invalid')
        }
    }

    async createUser({email, password}: CreateUserInput): Promise<any> {
        let salt = bcrypt.genSaltSync(10)
        let dbPassword = bcrypt.hashSync(password, salt)
        let existingUser = await this.collection.findOne({email:email})
        if(!existingUser){
            let newUser = await this.collection.insertOne({email, password: dbPassword})
            if(newUser.result.ok){
                return {
                    email
                }
            } else {
                throw new Error('Unable to create user in database')
            }
        } else {
            throw new Error('User already exists')
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

interface UserOuput {
    _id: string,
    email: string,
    username: string,
    token?: string
}