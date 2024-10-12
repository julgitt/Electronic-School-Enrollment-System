import { compare, hash } from 'bcrypt';

import userRepository from '../repositories/userRepository';
import { User } from '../models/userModel';
import { AuthenticationError } from "../errors/authenticationError";
import { ValidationError } from "../errors/validationError";

class UserService {
    async login(login: string, password: string): Promise<User> {
        const existingUser: User | null = await userRepository.getByLoginOrEmail(login, login);
        if (!existingUser || !(await compare(password, existingUser.password))) {
            throw new AuthenticationError('Invalid credentials.');
        }

        return existingUser;
    }

    async register(login: string, email: string, firstName: string, lastName: string, password: string): Promise<void> {
        const existingUser = await userRepository.getByLoginOrEmail(login, email, false);
        if (existingUser) {
            if (existingUser.login === login) {
                throw new ValidationError('Login is already taken.', 409);
            }
            if (existingUser.email === email) {
                throw new ValidationError('There is already an account with that email.', 409);
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

        await userRepository.insert(newUser);
    }

    async hasRole(id: number, role: string): Promise<boolean> {
        const roles = await userRepository.getUserRoles(id);
        return roles.includes(role);
    }
}

export default new UserService();