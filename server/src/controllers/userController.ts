import { Request, Response, NextFunction } from 'express';
import { validationResult } from "express-validator";

import { UserService } from '../services/userService';

export class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    async registerUser(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next({
                status: 400,
                message: "Validation Error",
                errors: errors.array()
            });
        }

        const { txtUser: login, txtEmail: email, txtPwd: password, txtFirstName: firstName, txtLastName: lastName } = req.body;

        try {
            const user = await this.userService.registerUser(login, email, firstName, lastName, password);
            return res.status(201).json({ message: 'Signup successful', user: { username: user.login }, redirect: '/login' });
        } catch (error) {
            return next({
                status: 400,
                message: (error instanceof Error ? error.message : "Register Error"),
                error });
        }
    }

    async loginUser(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next({
                status: 400,
                message: "Validation Error",
                errors: errors.array()
            });
        }

        const { txtUser: loginOrEmail, txtPwd: password } = req.body;

        try {
            const user = await this.userService.authenticateUser(loginOrEmail, password);
            res.cookie('username', user.firstName, { signed: true });
            res.cookie('user', user.id, { signed: true });

            const isAdmin = await this.userService.isUserInRole(user.id, 'admin');
            let returnUrl = isAdmin ? '/admin_dashboard' : req.query.returnUrl || '/';

            return res.status(200).json({ message: 'Login successful', redirect: returnUrl });
        } catch (error) {
            return next({
                status: 401,
                message: (error instanceof Error ? error.message : "Login error"),
                error: error
            });
        }
    }

    async logout(_req: Request, res: Response, next: NextFunction) {
        try {
            res.cookie('user', '', { maxAge: -1 });
            res.cookie('username', '', { maxAge: -1 });
            return res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            return next({
                status: 500,
                message: (error instanceof Error ? error.message : "Logout Error"),
                error
            });
        }
    }

    async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const username = req.signedCookies.username
            if (username) {
                return res.status(200).json({ username: username });
            } else {
                return next({
                    status: 401,
                    message: 'Not authenticated'
                });
            }
        } catch (error) {
            return next({
                status: 500,
                message: (error instanceof Error ? error.message : "Get User Error"),
                error
            });
        }
    }
}
