import {NextFunction, Request, Response} from 'express';

import {UserService} from "../services/userService";
import {userRequest} from "../dto/user/userRequest";
import {UserWithRoles} from "../dto/user/userWithRoles";


export class UserController {
    constructor(private userService: UserService) {
    }

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const user: userRequest = req.body;

            await this.userService.register(user);
            return res.status(201).json({
                message: 'Signup successful',
                user: {username: user.username},
                redirect: '/login'
            });
        } catch (error) {
            return next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        const {username: loginOrEmail, password} = req.body;

        try {
            const user: UserWithRoles = await this.userService.login(loginOrEmail, password);

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

            return res.status(200).json({message: 'Login successful', redirect: req.query.returnUrl || '/'});
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
            res.clearCookie('schoolId');
            res.clearCookie('profileId');
            return res.status(200).json({message: 'Logout successful'});
        } catch (error) {
            return next(error);
        }
    }

    async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id: number | null = req.signedCookies.userId || null;
            const roles: number | null = req.signedCookies.roles || null;
            return res.status(200).json({id: id, roles: roles});
        } catch (error) {
            return next(error);
        }
    }
}