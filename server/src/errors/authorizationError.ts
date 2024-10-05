import { CustomError } from './customError';

export class AuthorizationError extends CustomError {
    constructor(message: string = 'Insufficient permissions') {
        super(message, 403);
    }
}
