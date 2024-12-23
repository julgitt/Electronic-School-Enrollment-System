import { body } from "express-validator";

export const enrollmentValidator = [
    body("round")
        .isInt({ min: 1 })
        .withMessage("Tura musi być liczbą całkowitą większą od zera."),
    body("startDate")
        .isISO8601()
        .withMessage("Data musi mieć poprawny formatowanie"),
    body("endDate")
        .isISO8601()
        .withMessage("Data musi mieć poprawne formatowanie"),
    body("endDate").custom((value, { req }) => {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);
        if (endDate <= startDate) {
            throw new Error("Data rozpoczęcia musi być przed datą zakończenia");
        }
        return true;
    }),
];
