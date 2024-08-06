import { compare, hash } from 'bcrypt';

import { UserRepository } from '../repositories/userRepository';
import { User } from '../models/userModel';

export class UserService {
    private repo: UserRepository;

    constructor() {
        this.repo = new UserRepository();
    }

    async validateUser(loginOrEmail: string | null = null, password: string): Promise<boolean> {
        const user: User | null = await this.repo.getUser(loginOrEmail);
        if (!user) {
            throw new Error('User not found.');
        }
        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password.');
        }
        return true;
    }

    async isUserInRole(loginOrEmail: string, role: string): Promise<boolean> {
        const user = await this.repo.getUser(loginOrEmail, loginOrEmail);
        if (!user) {
            throw new Error('User not found.');
        }
        return user.roles.includes(role);
    }

    async registerUser(login: string, email: string, firstName: string, lastName: string, password: string): Promise<User> {
        const isLoginTaken = await this.isLoginTaken(login);
        const isEmailTaken = await this.isEmailTaken(email);
        if (isLoginTaken) {
            throw new Error('Login is already taken.');
        }
        if (isEmailTaken) {
            throw new Error('There is already account with that email.');
        }

        const id = new Date().getTime();
        const hashedPassword = await hash(password, 12);

        const newUser: User = {
            userId: id,
            login: login,
            firstName: firstName,
            lastName : lastName,
            email: email,
            password: hashedPassword,
            roles: ['user'],
        };

        return await this.repo.insertUser(newUser);
    }

    async isEmailTaken(email: string): Promise<boolean> {
        const user: User | null = await this.repo.getUser(null, email);
        return !!user;
    }

    async isLoginTaken(login: string): Promise<boolean> {
        const user: User | null = await this.repo.getUser(login);
        return !!user;
    }
}
