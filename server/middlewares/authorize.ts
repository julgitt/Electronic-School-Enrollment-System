import { Request, Response, NextFunction } from 'express';

import { UserService } from '../services/userService';

const userService = new UserService();

export function authorize(...roles: string[]) {
    return async function (req: Request, res: Response, next: NextFunction) {
        const user = req.signedCookies.user;

        if (roles.length === 0) {
            req.user = user;
            return next();
        }

        if (!user) {
            return res.status(401).json({ message: 'Not authorized', redirect: '/login?returnUrl=' + req.url});
        }

        const userRoles = await Promise.all(roles.map((role) => userService.isUserInRole(user, role)));

        if (userRoles.some((isInRole) => isInRole)) {
                req.user = user;
                return next();
        }

        return res.status(403).json({ message: 'Access denied.' });
    };
}
