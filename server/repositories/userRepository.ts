import { User, UserModel } from "../models/userModel";

export class UserRepository {

    constructor() { }

    // get user from database
    async getUser(login: string | null = null, email: string | null = null): Promise<User | null> {
        return await UserModel.find(login, email);
    }

    async insertUser(newUser: User) {
        const existingUser = await UserModel.find(newUser.login, newUser.email);
        if (existingUser) {
            throw new Error('User already exists.');
        }
        return await UserModel.insert(newUser);
    }
}
