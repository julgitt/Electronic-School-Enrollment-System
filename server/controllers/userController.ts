import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async registerUser(req: Request, res: Response) {
        const { txtUser: login, txtEmail: email, txtPwd: password, txtFirstName: firstName, txtLastName: lastName } = req.body;
        try {
            const user = await this.userService.registerUser(login, email, firstName, lastName, password);
            return res.status(201).json({ message: 'Signup successful', user: { username: user.login }, redirect: '/login' });
        } catch (error) {
            console.error('Signup error:', error);
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(400).json({ message: "Register error: unknown error"});
        }
    }

    async loginUser(req: Request, res: Response) {
        const { txtUser: loginOrEmail, txtPwd: password } = req.body;
        try {
            await this.userService.validateUser(loginOrEmail, password);
            res.cookie('user', loginOrEmail, { signed: true });
            let returnUrl = req.query.returnUrl as string;
            if (await this.userService.isUserInRole(loginOrEmail, 'admin')) {
                returnUrl = '/admin_dashboard';
            }
            return res.status(200).json({ message: 'Login successful', redirect: returnUrl || '/' });
        } catch (error) {
            console.error('Login error:', error);
            if (error instanceof Error) {
                return res.status(401).json({ message: error.message });
            }
            return res.status(401).json({ message: "Login error: unknown error"});
        }
    }

    async logout(_req: Request, res: Response) {
        res.cookie('user', '', { maxAge: -1 });
        return res.status(200).json({ message: 'Logout successful' });
    }

    async getUser(req: Request, res: Response) {
        if (req.signedCookies.user) {
            return res.json({ username: req.signedCookies.user });
        } else {
            return res.status(401).json({ message: 'Not authenticated' });
        }
    }
}
