export interface User {
    userId: number;
    login: string;
    email: string;
    password: string;
    roles: string[];
}

const users: User[] = [];

export class UserModel {
    static async find(login: string | null = null, email: string | null = null): Promise<User | null> {
        const user = users.find(user => {
            return (
                (login && user.login === login) ||
                (email && user.email === email)
            );
        });
        return user || null
    }

    static async insert(newUser: User): Promise<User> {
        users.push(newUser);
        return newUser;
    }
}
