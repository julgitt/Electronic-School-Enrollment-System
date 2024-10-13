import { User, UserRole } from '../models/userModel';
import { db } from '../db';


class UserRepository {
    async getByLoginOrEmail(login: string, email: string, withRoles: boolean = true): Promise<User | null> {
        return withRoles
            ? this.getWithRolesByLoginOrEmail(login, email)
            : this.getWithoutRolesByLoginOrEmail(login, email);
    }

    async getUserRoles(userId: number): Promise<string[]> {
        const query = `
            SELECT role_name
            FROM user_roles
            WHERE user_id = $1;
        `;
        const roles: UserRole[] = await db.query(query, [userId]);

        return roles.map((role: UserRole) => role.roleName);
    }

    async insert(newUser: Omit<User, 'id'>): Promise<void> {
        return db.tx(async t => {
            const userInsertQuery = `
                INSERT INTO users (login, first_name, last_name, email, password)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id;
            `;
            const values = [newUser.login, newUser.firstName, newUser.lastName, newUser.email, newUser.password];
            const user: User = await t.one(userInsertQuery, values);

            await this.insertUserRoles(user.id, newUser.roles, t);
        });
    }

    private async getWithRolesByLoginOrEmail(login: string, email: string): Promise<User | null> {
        const query = `
            SELECT u.*, array_agg(r.role_name) as roles
            FROM users u
            LEFT JOIN user_roles r ON u.id = r.user_id
            WHERE u.login = $1 or u.email = $2
            GROUP BY u.id
            LIMIT 1;
        `;
        const user: User = await db.one(query, [login, email]);

        return user || null;
    }

    private async getWithoutRolesByLoginOrEmail(login: string, email: string): Promise<User | null> {
        const query = `
            SELECT * 
            FROM users 
            WHERE login = $1 OR email = $2
            LIMIT 1;
        `;
        const user: User = await db.one(query, [login, email]);

        return user || null;
    }

    private async insertUserRoles(userId: number, roles: string[], t: any): Promise<void> {
        const query = `
            INSERT INTO user_roles (user_id, role_name)
            VALUES ($1, $2);
        `;
        const queries = roles.map(roleName => t.none(query, [userId, roleName]));

        await Promise.all(queries);
    }
}

export default new UserRepository()
