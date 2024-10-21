import { compare, hash } from 'bcrypt';
import { ITask } from "pg-promise";

import { User } from '../models/userModel';
import { UserRepository } from '../repositories/userRepository';
import { AuthenticationError } from "../errors/authenticationError";
import { ValidationError } from "../errors/validationError";

export class UserService {
    private _userRepository: UserRepository;
    //TODO: Add interface
    private readonly _tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>;

    constructor(userRepository: UserRepository, tx: (callback: (t: ITask<any>) => Promise<void>) => Promise<void>) {
        this._userRepository = userRepository;
        this._tx = tx
    }

    async login(login: string, password: string): Promise<User> {
        const existingUser: User | null = await this._userRepository.getByLoginOrEmail(login, login);
        if (!existingUser || !(await compare(password, existingUser.password))) {
            throw new AuthenticationError('Invalid credentials.');
        }

        return existingUser;
    }

    async register(login: string, email: string, firstName: string, lastName: string, password: string): Promise<void> {
        const existingUser = await this._userRepository.getByLoginOrEmail(login, email, false);
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

        await this._tx(async t => {
            const user = await this._userRepository.insert(newUser, t);
            await this._userRepository.insertUserRoles(user.id, newUser.roles, t);
        });
    }

    async hasRole(id: number, role: string): Promise<boolean> {
        const roles = await this._userRepository.getUserRoles(id);
        return roles.includes(role);
    }
}
