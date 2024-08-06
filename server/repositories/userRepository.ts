import users, { User } from '../models/userModel';

export class UserRepository {
    constructor() {}

    async getUser(login: string | null = null, email: string | null = null): Promise<User | null> {
        return users.find(user => user.login === login || user.email === email) || null;
    }

    async insertUser(newUser: User): Promise<User> {
        const existingUser = await this.getUser(newUser.login, newUser.email);
        if (existingUser) {
            throw new Error('User already exists.');
        }
        users.push(newUser);
        return newUser;
    }
}
