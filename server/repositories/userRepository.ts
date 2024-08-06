import users, { User } from '../models/userModel';

export class UserRepository {
    constructor() {}

    async getUserByLogin(login:string): Promise<User | null> {
        return users.find(user => user.login === login) || null
    }

    async getUserByEmail(email:string): Promise<User | null> {
        return users.find(user => user.email === email) || null
    }

    async getUserByIdentifier(identifier: string): Promise<User | null> {
        return users.find(user => user.login === identifier || user.email === identifier) || null;
    }

    async insertUser(newUser: User): Promise<User> {
        const existingUserByLogin = await this.getUserByLogin(newUser.login);
        const existingUserByEmail = await this.getUserByEmail(newUser.email);
        if (existingUserByLogin || existingUserByEmail) {
            throw new Error('User already exists.');
        }
        users.push(newUser);
        return newUser;
    }
}
