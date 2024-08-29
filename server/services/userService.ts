import { compare, hash } from 'bcrypt';

import { UserRepository } from '../repositories/userRepository';
import { User } from '../models/userModel';

export class UserService {
    private repo: UserRepository;

    constructor() {
        this.repo = new UserRepository();
    }

    async authenticateUser(identifier: string, password: string): Promise<User> {
        const user: User | null = await this.repo.getUserByIdentifier(identifier);
        if (!user) {
            throw new Error('User not found.');
        }
        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password.');
        }
        return user;
    }

    async isUserInRole(identifier: string, role: string): Promise<boolean> {
        const user = await this.repo.getUserByIdentifier(identifier);
        if (!user) {
            throw new Error('User not found.');
        }
        return user.roles.includes(role);
    }

    async registerUser(login: string, email: string, firstName: string, lastName: string, password: string): Promise<User> {
        const isLoginTaken = await this.repo.getUserByLogin(login);
        const isEmailTaken = await this.repo.getUserByEmail(email);
        if (isLoginTaken) {
            throw new Error('Login is already taken.');
        }
        if (isEmailTaken) {
            throw new Error('There is already an account with that email.');
        }

        const hashedPassword = await hash(password, 12);

        const newUser: Omit<User, 'id'> = {
            login,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            roles: ['user'],
        };

        return await this.repo.insertUser(newUser);
    }
}
