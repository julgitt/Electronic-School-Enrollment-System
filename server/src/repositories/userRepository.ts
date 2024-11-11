import { db, ITask } from '../db';
import { User } from '../models/userModel';

export class UserRepository {
    async getByLoginOrEmail(login: string, email: string, withRoles: boolean = true): Promise<User | null> {
        return withRoles
            ? this.getWithRolesByLoginOrEmail(login, email)
            : this.getWithoutRolesByLoginOrEmail(login, email);
    }

    async insert(newUser: Omit<User, 'id'>, t: ITask<any>): Promise<User> {
        const userInsertQuery = `
            INSERT INTO users (login, email, password)
            VALUES ($1, $2, $3)
            RETURNING id;
        `;

        const values = [newUser.login, newUser.email, newUser.password];
        return t.one(userInsertQuery, values);
    }

    async insertUserRoles(userId: number, roles: string[], t: ITask<any>): Promise<void> {
        const query = `
            INSERT INTO user_roles (user_id, role_name)
            VALUES ($1, $2);
        `;

        for (const roleName of roles) {
            await t.none(query, [userId, roleName]);
        }
    }

    private async getWithRolesByLoginOrEmail(login: string, email: string): Promise<User | null> {
        const query = `
            SELECT u.*, array_agg(r.role_name) as roles
            FROM users u
            LEFT JOIN user_roles r ON u.id = r.user_id
            WHERE u.login = $1 or u.email = $2
            GROUP BY u.id
        `;
        return await db.oneOrNone(query, [login, email]);
    }

    private async getWithoutRolesByLoginOrEmail(login: string, email: string): Promise<User | null> {
        const query = `
            SELECT * 
            FROM users 
            WHERE login = $1 OR email = $2
            LIMIT 1;
        `;

        return await db.oneOrNone(query, [login, email]);
    }
}
