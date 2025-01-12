import {compare, hash} from 'bcrypt';

import {transactionFunction} from "../db";

import {UserRepository} from '../repositories/userRepository';
import {AuthenticationError} from "../errors/authenticationError";
import {DataConflictError} from "../errors/dataConflictError";
import {UserRequest} from "../dto/user/userRequest";
import {UserWithRoles} from "../dto/user/userWithRoles";
import {User} from "../dto/user/user";
import {UserEntity} from "../models/userEntity";

export class UserService {
    constructor(
        private userRepository: UserRepository,
        private readonly tx: transactionFunction
    ) {
    }

    /**
     *  Loguje użytkownika na podstawie loginu i hasła.
     *
     * @param {string} login - Login lub email użytkownika.
     * @param {string} password - Hasło użytkownika.
     * @returns {Promise<UserWithRoles>} Zwraca obiekt użytkownika razem z jego rolami.
     *
     * @throws {AuthenticationError} Jeśli login/email lub hasło są nieprawodłowe.
     */
    async login(login: string, password: string): Promise<UserWithRoles> {
        const existingUser: UserWithRoles | null = await this.userRepository.getWithRolesByLoginOrEmail(login, login);
        if (!existingUser || !(await compare(password, existingUser.password))) {
            throw new AuthenticationError('Nieprawidłowe email/nazwa użytkownika lub hasło');
        }

        return existingUser;
    }

    /**
     *  Rejestruje nowego użytkownika.
     *
     * @param {UserRequest} user - obiekt zawierający nazwę użytkownika, email oraz hasło.
     * @returns {Promise<void>}
     *
     * @throws {DataConflictError} Jeśli istnieje już użytkownik z podanym emailem lub nazwą użytkownika.
     */
    async register(user: UserRequest): Promise<void> {
        const existingUser: User | null = await this.userRepository.getWithoutRolesByLoginOrEmail(user.username, user.email);
        if (existingUser) {
            if (existingUser.username === user.username) {
                throw new DataConflictError('Już istnieje konto powiązane z tą nazwą użytkownika.');
            }
            if (existingUser.email === user.email) {
                throw new DataConflictError('Już istnieje konto powiązane z tym adresem email.');
            }
        }

        const hashedPassword: string = await hash(user.password, 12);
        const newUser: UserEntity = {
            id: 0,
            username: user.username,
            email: user.email,
            password: hashedPassword,
        };

        await this.tx(async t => {
            const user: UserEntity = await this.userRepository.insert(newUser, t);
            await this.userRepository.insertUserRoles(user.id, ['user'], t);
        });
    }

    /**
     *  Usuwa użytkownika.
     *
     * @param {number} id - identyfikator użytkownika.
     * @returns {Promise<void>}
     */
    async deleteUser(id: number): Promise<void> {
        await this.userRepository.deleteById(id)
    }
}
