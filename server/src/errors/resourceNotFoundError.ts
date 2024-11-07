import {CustomError} from "./customError";

export class ResourceNotFoundError extends CustomError {
    constructor(message: string = 'Data does not exist') {
        super(message, 404);
    }
}