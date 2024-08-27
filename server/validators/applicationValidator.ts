import { body } from 'express-validator';

export const applicationValidator = [
    body('txtFirstName')
        .notEmpty().withMessage("Name is required")
        .matches(/^[a-zA-Z\\]+$/).withMessage("Name can only contain letters"),
     body('txtLastName')
        .notEmpty().withMessage("Last name is required")
        .matches(/^[a-zA-Z\\]+$/).withMessage("Last name can only contain letters"),
    body('txtPesel')
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/[a-zA-Z0-9!@#$%^&*_=+-]+/)
        .withMessage("Password can only contain letters, numbers, and special characters: !@#$%^&*_=+-"),
    body('txtSchools').custom((value, { req }) => {
        if (value !== req.body.txtPwd) {
            throw new Error("Passwords do not match");
        }
        return true;
    })
];
