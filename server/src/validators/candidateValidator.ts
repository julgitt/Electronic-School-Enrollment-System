import {body} from 'express-validator';

function validatePesel(pesel: string): boolean {
    if (!/^\d{11}$/.test(pesel)) {
        return false;
    }

    const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
    const digits = pesel.split('').map(Number);
    const checksum = digits
        .slice(0, 10)
        .reduce((acc, digit, index) => acc + digit * weights[index], 0);

    const controlNumber = (10 - (checksum % 10)) % 10;

    return controlNumber === digits[10];
}

export const candidateRegisterValidator = [
    body('firstName')
        .notEmpty().withMessage("Name is required.")
        .matches(/^[\p{L}]+$/u).withMessage("Name can only contain letters."),
    body('lastName')
        .notEmpty().withMessage("Last name is required.")
        .matches(/^[\p{L}]+$/u).withMessage("Last name can only contain letters."),

    body('pesel')
        .notEmpty().withMessage("Pesel is required.")
        .custom((value) => {
            return validatePesel(value);
        }).withMessage("Invalid Pesel number"),
];