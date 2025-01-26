import {NextFunction, Request, Response} from 'express';

export function authorize(...roles: string[]) {
    return async function (req: Request, res: Response, next: NextFunction) {
        const userId = req.signedCookies.userId;
        const userRoles: string[] = req.signedCookies.roles;
        const candidateId = req.signedCookies.candidateId;

        if (roles.length === 0) {
            req.user = userId;
            return next();
        }

        if (!userId) {
            return res.status(401).json({message: 'Not authorized', redirect: '/login?returnUrl=' + req.url});
        }

        if (userRoles && roles.some(role => userRoles.includes(role))) {
            if (roles.includes('candidate') && candidateId == null) {
                return res.status(401).json({message: 'Not authorized', redirect: '/registerCandidate?returnUrl=' + req.url});
            }
            req.user = userId;
            return next();
        }

        return res.status(403).json({message: 'Access denied.'});
    };
}
