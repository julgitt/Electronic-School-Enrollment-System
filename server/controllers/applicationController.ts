import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    private respondWithError(res: Response, message: string, error: any, status: number){
        console.error(message, error);
        return res.status(status).json({
            message: error instanceof Error ? error.message : message + "An unknown error occurred."
        });
    }

    async registerUser(req: Request, res: Response) {
        const { txtUser: login, txtEmail: email, txtPwd: password, txtFirstName: firstName, txtLastName: lastName } = req.body;
        try {
            const user = await this.userService.registerUser(login, email, firstName, lastName, password);
            return res.status(201).json({ message: 'Signup successful', user: { username: user.login }, redirect: '/login' });
        } catch (error) {
            return this.respondWithError(res, "Register Error: ", error, 400)
        }
    }
}
