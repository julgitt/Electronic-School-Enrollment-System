import { User, UserRole } from '../models/userModel';
import { db } from '../db';

export class UserRepository {
    constructor() {}

    async getUserByLogin(login:string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE login = $1';
        const result = await db.query(query, [login]);
        if (result.length === 0)
            return null;
        const user = result[0];
        user.roles = await this.getUserRoles(user.user_id);
        return user;
    }

    async getUserByEmail(email:string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await db.query(query, [email]);
        if (result.length === 0)
            return null;
        const user = result[0];
        user.roles = await this.getUserRoles(user.user_id);
        return user;
    }

    async getUserByIdentifier(identifier: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE login = $1 OR email = $1';
        const result = await db.query(query, [identifier]);
        if (result.length === 0)
            return null;
        const user = result[0];
        user.roles = await this.getUserRoles(user.user_id);
        return user;
    }

    async insertUser(newUser: Omit<User, 'id'>): Promise<User> {
        const existingUserByLogin = await this.getUserByLogin(newUser.login);
        const existingUserByEmail = await this.getUserByEmail(newUser.email);

        if (existingUserByLogin || existingUserByEmail) {
            throw new Error('User already exists.');
        }

        const userInsertQuery = `
            INSERT INTO users (login, first_name, last_name, email, password)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [newUser.login, newUser.firstName, newUser.lastName, newUser.email, newUser.password];

        const result = await db.query(userInsertQuery, values);
        const user = result[0] as User;

        await this.insertUserRoles(user.id, newUser.roles);
        return user
    }

    private async getUserRoles(userId: number): Promise<string[]> {
        const query = `
            SELECT role_name
            FROM user_roles
            WHERE user_id = $1;
        `;
        const result = await db.query(query, [userId]);

        return result.map((row: UserRole) => row.role_name);
    }

    private async insertUserRoles(userId: number, roles: string[]): Promise<void> {
        const insertRoleQuery = `
            INSERT INTO user_roles (user_id, role_name)
            VALUES ($1, $2);
        `;

        for (const roleName of roles) {
            await db.query(insertRoleQuery, [userId, roleName]);
        }
    }
}