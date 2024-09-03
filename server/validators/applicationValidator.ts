import { body } from 'express-validator';

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


export const applicationValidator = [
    body('txtFirstName')
        .notEmpty().withMessage("Name is required.")
        .matches(/^[\p{L}]+$/u).withMessage("Name can only contain letters."),
    body('txtLastName')
        .notEmpty().withMessage("Last name is required.")
        .matches(/^[\p{L}]+$/u).withMessage("Last name can only contain letters."),

    body('txtPesel')
        .notEmpty().withMessage("Pesel is required.")
        .custom((value) => {
        if (!validatePesel(value)) {
            throw new Error('Invalid Pesel number.');
        }
        return true;
        }),
    body('txtSchools')
        .isArray({ min: 1 }).withMessage('At least one school must be selected.')
];
