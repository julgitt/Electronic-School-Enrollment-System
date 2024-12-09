import {CustomError} from './customError';

export class AuthorizationError extends CustomError {
    constructor(message: string = 'Access denied') {
        super(message, 403);
    }
}
