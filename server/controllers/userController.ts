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

    async loginUser(req: Request, res: Response) {
        const { txtUser: loginOrEmail, txtPwd: password } = req.body;
        try {
            const user = await this.userService.authenticateUser(loginOrEmail, password);
            res.cookie('username', user.firstName, { signed: true });
            res.cookie('user', user.id, { signed: true });

            const isAdmin = await this.userService.isUserInRole(loginOrEmail, 'admin');

            let returnUrl = isAdmin ? '/admin_dashboard' : req.query.returnUrl || '/';
            return res.status(200).json({ message: 'Login successful', redirect: returnUrl });
        } catch (error) {
            return this.respondWithError(res, "Login Error: ", error, 401)
        }
    }

    async logout(_req: Request, res: Response) {
        res.cookie('user', '', { maxAge: -1 });
        res.cookie('username', '', { maxAge: -1 });
        return res.status(200).json({ message: 'Logout successful' });
    }

    async getUser(req: Request, res: Response) {
        const username = req.signedCookies.username
        if (username) {
            return res.json({ username: username });
        } else {
            return res.status(401).json({ message: 'Not authenticated' });
        }
    }
}
