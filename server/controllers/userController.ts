import { compare, hash } from 'bcrypt';

import { UserRepository } from '../repositories/userRepository';
import { User } from '../models/userModel';

export class UserController {
    private repo: UserRepository;

    constructor() {
        this.repo = new UserRepository();
    }

    async getUser(login: string | null = null, email: string | null = null, password: string) {
        const user: User | null = await this.repo.getUser(login, email);

        if (user != null) {
            return await compare(password, user.password);
        }

        return false;
    }

    async isEmailTaken(email: string) {
        const user: User | null = await this.repo.getUser(null, email);
        return !!user;
    }

    async isLoginTaken(login: string) {
        const user = await this.repo.getUser(login);
        return !!user;
    }

    async getRoles(login: string) {
        const user: User | null = await this.repo.getUser(login);
        return user ? user.roles : [];
    }

    async doInsertUser(login: string, email: string, password: string) {
        try {
            const id = new Date().getTime();

            const user : User = {
                userId: id,
            login: login,
                email: email,
                password: await hash(password, 12),
                roles: ['logged'],
            };

            return await this.repo.insertUser(user);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Failed to insert user: ${error.message}`);
            } else {
                throw new Error('Failed to insert user: Unknown error');
            }
        }
    }
}
