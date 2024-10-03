import { compare, hash } from 'bcrypt';

import { UserRepository } from '../repositories/userRepository';
import { User } from '../models/userModel';

export class UserService {
    private repo: UserRepository;

    constructor(userRepository: UserRepository) {
        this.repo = userRepository;
    }

    async authenticateUser(identifier: string, password: string): Promise<User> {
        const user: User | null = await this.repo.getUserWithRolesByLoginOrEmail(identifier);
        if (!user) {
            throw new Error('Invalid login or password.');
        }
        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid login or password.');
        }
        return user;
    }

    async isUserInRole(id: number, role: string): Promise<boolean> {
        const roles = await this.repo.getUserRoles(id);
        return roles.includes(role);
    }

    async registerUser(login: string, email: string, firstName: string, lastName: string, password: string): Promise<User> {
        const existingUser = await this.repo.getUserByLoginOrEmail(login, email);
        //TODO: Instead of multiple messages glued together, throw multiple errors!
        // Change error throwing to throw custom errors
        if (existingUser) {
            const errorMessages = [];
            if (existingUser.login === login) {
                errorMessages.push('Login is already taken.');
            }
            if (existingUser.email === email) {
                errorMessages.push('There is already an account with that email.');
            }
            throw new Error(errorMessages.join(' '));
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

        return this.repo.insertUser(newUser);
    }
}
