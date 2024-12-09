import {db, ITask} from '../db';
import {UserEntity} from "../models/userEntity";
import {UserEntityWithRoles} from "../models/userEntityWithRoles";

export class UserRepository {

    async insert(newUser: UserEntity, t: ITask<any>): Promise<UserEntity> {
        const userInsertQuery = `
            INSERT INTO users (username, email, password)
            VALUES ($1, $2, $3)
            RETURNING id;
        `;

        const values = [newUser.username, newUser.email, newUser.password];
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

    async getWithRolesByLoginOrEmail(username: string, email: string): Promise<UserEntityWithRoles | null> {
        const query = `
            SELECT u.*, array_agg(r.role_name) as roles
            FROM users u
            LEFT JOIN user_roles r ON u.id = r.user_id
            WHERE u.username = $1 or u.email = $2
            GROUP BY u.id
            LIMIT 1
        `;
        return await db.oneOrNone(query, [username, email]);
    }

    async getWithoutRolesByLoginOrEmail(username: string, email: string): Promise<UserEntity | null> {
        const query = `
            SELECT * 
            FROM users 
            WHERE username = $1 OR email = $2
            LIMIT 1;
        `;

        return await db.oneOrNone(query, [username, email]);
    }
}
