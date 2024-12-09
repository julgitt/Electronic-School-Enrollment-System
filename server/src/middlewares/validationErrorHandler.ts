import {NextFunction, Request, Response} from 'express';
import {validationResult} from 'express-validator';

import {ValidationError} from '../errors/validationError';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ValidationError('Validation Error', errors.array()));
    }
    next();
};
