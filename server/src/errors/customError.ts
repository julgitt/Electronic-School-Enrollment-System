export class CustomError extends Error {
    public statusCode: number;
    public message: string;
    public isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}
