import { compare, hash } from 'bcrypt';

import { UserRepository } from '../repositories/userRepository';
import { User } from '../models/userModel';

export class UserService {
    private repo: UserRepository;

    constructor() {
        this.repo = new UserRepository();
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

    // TODO: salt to config file
    async registerUser(login: string, email: string, firstName: string, lastName: string, password: string): Promise<User> {
        const existingUser = await this.repo.getUserByLoginOrEmail(login, email);

        if (existingUser) {
            if (existingUser.login === login) {
                throw new Error('Login is already taken.');
            }
            if (existingUser.email === email) {
                throw new Error('There is already an account with that email.');
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

        return await this.repo.insertUser(newUser);
    }
}
