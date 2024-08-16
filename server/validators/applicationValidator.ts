import { body } from 'express-validator';

export const applicationValidator = [
    body('txtUser')
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 5 }).withMessage("Username must be at least 5 characters long")
        .matches(/^[a-zA-Z0-9]+$/).withMessage("Username can only contain letters and numbers"),
    body('txtEmail').isEmail().withMessage("Email is not valid"),
    body('txtPwd')
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/[a-zA-Z0-9!@#$%^&*_=+-]+/)
        .withMessage("Password can only contain letters, numbers, and special characters: !@#$%^&*_=+-"),
    body('txtPwd_c').custom((value, { req }) => {
        if (value !== req.body.txtPwd) {
            throw new Error("Passwords do not match");
        }
        return true;
    })
];
