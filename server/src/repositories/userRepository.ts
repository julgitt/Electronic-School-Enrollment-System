import { User, UserRole } from '../models/userModel';
import { db } from '../db';


export class UserRepository {
    constructor() {}

    async getByLoginOrEmail(login: string, email: string, withRoles: boolean = true) : Promise<User | null> {
        if (withRoles) {
            return this.getUserWithRolesByLoginOrEmail(login, email);
        } else {
            return this.getUserWithoutRolesByLoginOrEmail(login, email);
        }
    }

    async getRoles(userId: number): Promise<string[]> {
        const query = `
            SELECT role_name
            FROM user_roles
            WHERE user_id = $1;
        `;
        const result = await db.query(query, [userId]);
        return result.map((row: UserRole) => row.roleName);
    }

    async insert(newUser: Omit<User, 'id'>): Promise<User> {
        return db.tx(async t => {
            const userInsertQuery = `
                INSERT INTO users (login, first_name, last_name, email, password)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
            `;
            const values = [newUser.login, newUser.firstName, newUser.lastName, newUser.email, newUser.password];
            const result = await t.one(userInsertQuery, values);
            const user = result as User;

            await this.insertUserRoles(user.id, newUser.roles, t);

            return user;
        });
    }

    private async getUserWithRolesByLoginOrEmail(login: string, email: string): Promise<User | null> {
        const query = `
            SELECT u.*, r.role_name
            FROM users u
            LEFT JOIN user_roles r ON u.id = r.user_id
            WHERE u.login = $1 or u.email = $2;
        `;
        const result = await db.query(query, [login, email]);
        return this.mapUserWithRoles(result);
    }

    private async getUserWithoutRolesByLoginOrEmail(login: string, email: string): Promise<User | null> {
        const query = `
            SELECT * 
            FROM users 
            WHERE login = $1 OR email = $2
            LIMIT 1
        `;
        const result = await db.query(query, [login, email]);
        return result.length > 0 ? result[0] : null;
    }

    private async insertUserRoles(userId: number, roles: string[], t: any): Promise<void> {
        const insertRoleQuery = `
        INSERT INTO user_roles (user_id, role_name)
        VALUES ($1, $2);
    `;
        const queries = roles.map(roleName => t.none(insertRoleQuery, [userId, roleName]));
        await Promise.all(queries);
    }

    private async mapUserWithRoles(result: any[]): Promise<User | null> {
        if (result.length === 0) {
            return null;
        }

        const user = result[0];
        user.roles = result.map(row => row.role_name).filter(role => role);
        return user;
    }
}