import { Request, Response, NextFunction } from 'express';

import { AuthenticationError } from "../errors/authenticationError";
import defaultUserService, { UserService } from "../services/userService";

export class UserController {
    private userService: UserService;

    constructor(userService?: UserService) {
        if (userService != null) {
            this.userService = userService;
        } else {
            this.userService = defaultUserService
        }
    }

    async register(req: Request, res: Response, next: NextFunction) {
        const { txtUser: login, txtEmail: email, txtPwd: password, txtFirstName: firstName, txtLastName: lastName } = req.body;

        try {
            await this.userService.register(login, email, firstName, lastName, password);
            return res.status(201).json({ message: 'Signup successful', user: { username: login }, redirect: '/login' });
        } catch (error) {
            return next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        const { txtUser: loginOrEmail, txtPwd: password } = req.body;

        try {
            const user = await this.userService.login(loginOrEmail, password);
            res.cookie('username', user.firstName, { signed: true, maxAge: 86400000 });
            res.cookie('user', user.id, {
                signed: true,
                secure: true,
                httpOnly: true,
                maxAge: 86400000
            });

            const isAdmin = await this.userService.hasRole(user.id, 'admin');
            let returnUrl = isAdmin ? '/admin_dashboard' : req.query.returnUrl || '/';

            return res.status(200).json({ message: 'Login successful', redirect: returnUrl });
        } catch (error) {
            return next(error);
        }
    }

    async logout(_req: Request, res: Response, next: NextFunction) {
        try {
            res.clearCookie('user');
            res.clearCookie('username');
            return res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            return next(error);
        }
    }

    async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const username = req.signedCookies.username
            if (username) {
                return res.status(200).json({ username: username });
            } else {
                return next(new AuthenticationError('Not authenticated'));
            }
        } catch (error) {
            return next(error);
        }
    }
}

export default new UserController()