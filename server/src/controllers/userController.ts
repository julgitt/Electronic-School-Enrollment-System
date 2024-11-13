import { Request, Response, NextFunction } from 'express';

import { UserService } from "../services/userService";
import { CandidateService } from "../services/candidateService";

export class UserController {
    constructor(private userService: UserService, private candidateService: CandidateService) {
        this.userService = userService;
        this.candidateService = candidateService;
    }

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                username: login,
                email: email,
                password: password,
            } = req.body;

            await this.userService.register(login, email, password);
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
        const { username: loginOrEmail, password } = req.body;

        try {
            const user = await this.userService.login(loginOrEmail, password);
            if (user.roles.includes('admin'))
                return res.status(200).json({ message: 'Login successful', redirect: '/admin_dashboard' });

            res.cookie('userId', user.id, {
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

            return res.status(200).json({ message: 'Login successful', redirect: req.query.returnUrl || '/' });
        } catch (error) {
            return next(error);
        }
    }

    async logout(_req: Request, res: Response, next: NextFunction) {
        try {
            res.clearCookie('candidateId');
            res.clearCookie('candidateName');
            res.clearCookie('userId');
            res.clearCookie('roles');
            return res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            return next(error);
        }
    }
}