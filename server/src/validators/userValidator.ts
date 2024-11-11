import { body } from 'express-validator';

export const userSignupValidator = [
    body('username')
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 5 }).withMessage("Username must be at least 5 characters long")
        .matches(/^[a-zA-Z0-9]+$/).withMessage("Username can only contain letters and numbers"),
    body('email').isEmail().withMessage("Email is not valid"),
    body('password')
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/[a-zA-Z0-9!@#$%^&*_=+-]+/)
        .withMessage("Password can only contain letters, numbers, and special characters: !@#$%^&*_=+-"),
    body('passwordConfirm').custom((value, { req }) => {
        return value === req.body.password;
    }).withMessage("Passwords do not match")
];

export const userLoginValidator = [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
];
