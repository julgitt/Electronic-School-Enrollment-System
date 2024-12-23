import { body } from "express-validator";

export const profileValidator = [
    body("name")
        .isString()
        .notEmpty()
        .withMessage("Nazwa profilu jest wymagana."),
    body("capacity")
        .isInt({ min: 1 })
        .withMessage("Ilość miejsc musi być większa od zera"),
    body("criteria")
        .isArray({ min: 4, max: 5})
        .withMessage("Kryteria Profilu muszą być niepustą listą."),
    body("criteria.*.").custom((value, { req }) => {
        body("criteria.*.profileId")
            .isInt()
            .withMessage("Kryteria muszą mieć prawidłowe id profilu."),
        body("criteria.*.subjectId")
            .isInt()
            .withMessage("Kryteria muszą mieć prawidłowe id przedmiotu"),
        body("criteria.*.type")
            .isString()
            .notEmpty()
            .isIn(["mandatory", "alternative"])
            .withMessage(`Typ kryterium jest "mandatory" albo "alternative"`)
    }),
];