import {CustomError} from "./customError";

export class DataConflictError extends CustomError {
    constructor(message: string = 'Data already exists') {
        super(message, 409);
    }
}