import {NextFunction, Request, Response} from 'express';

import {CustomError} from "../errors/customError";
import {ValidationError} from "../errors/validationError";

const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.log(err);

    if (err instanceof ValidationError) {
        return res.status(err.statusCode).json({
            message: err.errors[0].msg,
            errors: err.errors
        });
    }

    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            message: err.message,
        });
    }

    return res.status(500).json({
        message: 'Internal Server Error',
    });
};

export default errorHandler;
