import { Request, Response, NextFunction } from 'express';

export function authorize(...roles: string[]) {
    return async function (req: Request, res: Response, next: NextFunction) {
        const userId = req.signedCookies.userToken;
        const userRoles: string[] = req.signedCookies.roles;

        if (roles.length === 0) {
            req.user = userId;
            return next();
        }

        if (!userId) {
            return res.status(401).json({ message: 'Not authorized', redirect: '/login?returnUrl=' + req.url});
        }

        if (userRoles && roles.some(role => userRoles.includes(role))) {
                req.user = userId;
                return next();
        }

        return res.status(403).json({ message: 'Access denied.' });
    };
}
