import {body} from 'express-validator';

export const userSignupValidator = [
    body('username')
        .notEmpty().withMessage("Podaj nazwę użytkownika.")
        .isLength({min: 5}).withMessage("Nazwa użytkownika musi mieć minimum 5 znaków.")
        .matches(/^[a-zA-Z0-9]+$/).withMessage("Nazwa użytkownika może zawierać tylko litery oraz cyfry."),
    body('email').isEmail().withMessage("Nieprawidłowy email"),
    body('password')
        .notEmpty().withMessage("Podaj hasło")
        .isLength({min: 8}).withMessage("Hasło musi mieć minimum 8 znaków.")
        .matches(/[a-zA-Z0-9.*[@$!%*?&]]+/)
        .withMessage("Hasło może zawierać jedynie litery, cyfry oraz znaki: .*[@$!%*?&]"),
    body('passwordConfirm').custom((value, {req}) => {
        return value === req.body.password;
    }).withMessage("Hasła nie są takie same.")
];

export const userLoginValidator = [
    body('username').notEmpty().withMessage('Podaj nazwę użytkownika lub adres email.'),
    body('password').notEmpty().withMessage('Podaj hasło.'),
];
