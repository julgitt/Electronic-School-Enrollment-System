import { compare, hash } from 'bcrypt';

import { transactionFunction } from "../db";

import { User } from '../models/userModel';
import { UserRepository } from '../repositories/userRepository';
import { AuthenticationError } from "../errors/authenticationError";
import { DataConflictError } from "../errors/dataConflictError";

export class UserService {
    constructor(
        private userRepository: UserRepository,
        private readonly tx: transactionFunction) {
        this.userRepository = userRepository;
        this.tx = tx
    }

    async login(login: string, password: string): Promise<User> {
        const existingUser: User | null = await this.userRepository.getByLoginOrEmail(login, login);
        if (!existingUser || !(await compare(password, existingUser.password))) {
            throw new AuthenticationError('Invalid credentials.');
        }

        return existingUser;
    }

    async register(login: string, email: string, firstName: string, lastName: string, password: string): Promise<void> {
        const existingUser = await this.userRepository.getByLoginOrEmail(login, email, false);
        if (existingUser) {
            if (existingUser.login === login) {
                throw new DataConflictError('Login is already taken.');
            }
            if (existingUser.email === email) {
                throw new DataConflictError('There is already an account with that email.');
            }
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

        await this.tx(async t => {
            const user = await this.userRepository.insert(newUser, t);
            await this.userRepository.insertUserRoles(user.id, newUser.roles, t);
        });
    }
}
