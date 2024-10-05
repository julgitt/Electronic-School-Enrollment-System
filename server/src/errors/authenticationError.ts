import {CustomError} from "./customError";

export class AuthenticationError extends CustomError {
    constructor(message: string = 'Authentication failed') {
        super(message, 401);
    }
}