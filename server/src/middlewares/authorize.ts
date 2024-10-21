import { Request, Response, NextFunction } from 'express';
import {UserRepository} from "../repositories/userRepository";
import {UserService} from "../services/userService";
import {tx} from "../db";

const userRepository: UserRepository = new UserRepository();
const userService: UserService = new UserService(userRepository, tx);

export function authorize(...roles: string[]) {
    return async function (req: Request, res: Response, next: NextFunction) {
        const userId = req.signedCookies.user;

        if (roles.length === 0) {
            req.user = userId;
            return next();
        }

        if (!userId) {
            return res.status(401).json({ message: 'Not authorized', redirect: '/login?returnUrl=' + req.url});
        }

        const userRoles = await Promise.all(roles.map((role) => userService.hasRole(userId, role)));

        if (userRoles.some((isInRole) => isInRole)) {
                req.user = userId;
                return next();
        }

        return res.status(403).json({ message: 'Access denied.' });
    };
}
