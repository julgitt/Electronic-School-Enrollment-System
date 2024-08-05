import { Request, Response, NextFunction } from 'express';

import {UserController} from '../controllers/userController';

const userCtrl = new UserController();

/**
 * Check if the user has a role with the given name.
 */
export async function isUserInRole(user: string, role: string) {
    const roles = await userCtrl.getRoles(user)
    return roles.includes(role);
}

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

        const userRoles = await Promise.all(roles.map((role) => isUserInRole(user, role)));

        if (userRoles.some((isInRole) => isInRole)) {
                req.user = user;
                return next();
        }

        return res.status(403).json({ message: 'Access denied.' });
    };
}
