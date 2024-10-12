import {CustomError} from "./customError";
import { ValidationError as ExpressValidationError} from "express-validator";

export class ValidationError extends CustomError {
    public errors: ExpressValidationError[];

    constructor(message: string, status: number, errors: ExpressValidationError[] = []) {
        super(message, status);
        this.errors = errors;
    }
}