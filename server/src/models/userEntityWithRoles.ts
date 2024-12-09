export interface UserEntityWithRoles {
    id: number;
    username: string;
    email: string;
    password: string;
    roles: string[];
}