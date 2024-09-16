import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);

    return res.status(err.status || 500).json({
        errors: err.errors,
        message: err.message || 'Internal Server Error',
    });
};

export default errorHandler;
