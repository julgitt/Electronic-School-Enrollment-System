export interface User {
    userId: number;
    login: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roles: string[];
}

const users: User[] = [];

export default users;
