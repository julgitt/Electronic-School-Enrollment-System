import { Request, Response, NextFunction } from 'express';

import { UserService } from "../services/userService";

export class UserController {
    constructor(private userService: UserService) {
        this.userService = userService;
    }

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                txtUser: login,
                txtEmail: email,
                txtPwd: password,
                txtFirstName: firstName,
                txtLastName: lastName
            } = req.body;

            await this.userService.register(login, email, firstName, lastName, password);
            return res.status(201).json({
                message: 'Signup successful',
                user: { username: login },
                redirect: '/login'
            });
        } catch (error) {
            return next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        const { txtUser: loginOrEmail, txtPwd: password } = req.body;

        try {
            const user = await this.userService.login(loginOrEmail, password);
            res.cookie('username', user.firstName, { signed: true, maxAge: 86400000 });
            res.cookie('userToken', user.id, {
                signed: true,
                secure: true,
                httpOnly: true,
                maxAge: 86400000
            });

            res.cookie('roles', user.roles, {
                signed: true,
                secure: true,
                httpOnly: true,
                maxAge: 86400000
            });

            const isAdmin = user.roles.includes('admin');
            let returnUrl = isAdmin ? '/admin_dashboard' : req.query.returnUrl || '/';

            return res.status(200).json({ message: 'Login successful', redirect: returnUrl });
        } catch (error) {
            return next(error);
        }
    }

    async logout(_req: Request, res: Response, next: NextFunction) {
        try {
            res.clearCookie('userToken');
            res.clearCookie('username');
            res.clearCookie('roles');
            return res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            return next(error);
        }
    }

    async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const username = req.signedCookies.username;
            const userToken = req.signedCookies.userToken;
            return res.status(200).json({ username: username, userToken: userToken });
        } catch (error) {
            return next(error);
        }
    }
}