import {body} from 'express-validator';

function validatePesel(pesel: string): boolean {
    if (!/^[0-9]+$/.test(pesel)) {
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
        .notEmpty().withMessage("Podaj imię.")
        .matches(/^[a-zA-Z0-9ąęćłńóśźżĄĘĆŁŃÓŚŹŻ]+$/).withMessage("Imię może zawierać jedynie litery."),
    body('lastName')
        .notEmpty().withMessage("Podaj nazwisko.")
        .matches(/^[a-zA-Z0-9ąęćłńóśźżĄĘĆŁŃÓŚŹŻ]+$/).withMessage("Nazwisko może zawierać jedynie litery."),

    body('pesel')
        .notEmpty().withMessage("Podaj pesel.")
        .custom((value) => {
            return validatePesel(value);
        }).withMessage("Błędny numer pesel."),
];