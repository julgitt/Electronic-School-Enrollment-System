import { compare, hash } from 'bcrypt';

import { UserRepository } from '../repositories/userRepository';
import { User } from '../models/userModel';
import {AuthenticationError} from "../errors/authenticationError";
import {ValidationError} from "../errors/validationError";

export class UserService {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async login(login: string, password: string): Promise<User> {
        const existingUser: User | null = await this.userRepository.getByLoginOrEmail(login, login);
        if (!existingUser) {
            throw new AuthenticationError('Invalid login or password');
        }
        const isPasswordValid = await compare(password, existingUser.password);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid login or password');
        }
        return existingUser;
    }

    async isInRole(id: number, role: string): Promise<boolean> {
        const roles = await this.userRepository.getRoles(id);
        return roles.includes(role);
    }

    async register(login: string, email: string, firstName: string, lastName: string, password: string): Promise<User> {
        const existingUser = await this.userRepository.getByLoginOrEmail(login, email, false);
        if (existingUser) {
            if (existingUser.login === login) {
                throw new ValidationError('Login is already taken.');
            } else if (existingUser.email === email) {
                throw new ValidationError('There is already an account with that email.');
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

        return this.userRepository.insert(newUser);
    }
}
