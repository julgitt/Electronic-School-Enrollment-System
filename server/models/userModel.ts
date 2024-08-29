export interface User {
    id: number;
    login: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roles: string[];
}

export interface UserRole {
    userId: number;
    role_name: string;
}