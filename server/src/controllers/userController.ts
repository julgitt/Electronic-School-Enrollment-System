import { Request, Response, NextFunction } from 'express';
import { validationResult } from "express-validator";

import userService from '../services/userService';
import { ValidationError } from "../errors/validationError";
import { AuthenticationError } from "../errors/authenticationError";

class UserController {

    async register(req: Request, res: Response, next: NextFunction) {
        const { txtUser: login, txtEmail: email, txtPwd: password, txtFirstName: firstName, txtLastName: lastName } = req.body;

        try {
            await userService.register(login, email, firstName, lastName, password);
            return res.status(201).json({ message: 'Signup successful', user: { username: login }, redirect: '/login' });
        } catch (error) {
            return next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        const { txtUser: loginOrEmail, txtPwd: password } = req.body;

        try {
            const user = await userService.login(loginOrEmail, password);
            res.cookie('username', user.firstName, { signed: true, maxAge: 86400000 });
            res.cookie('user', user.id, {
                signed: true,
                secure: true,
                httpOnly: true,
                maxAge: 86400000
            });

            const isAdmin = await userService.hasRole(user.id, 'admin');
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

export default new UserController();
