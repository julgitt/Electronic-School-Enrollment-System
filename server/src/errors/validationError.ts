import {CustomError} from "./customError";
import { ValidationError as ExpressValidationError} from "express-validator";

export class ValidationError extends CustomError {
    public errors: ExpressValidationError[];

    constructor(message: string, errors: ExpressValidationError[] = []) {
        super(message, 400);
        this.errors = errors;
    }
}