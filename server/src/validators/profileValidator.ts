import {body} from "express-validator";
import {ProfileCriteriaType} from "../models/profileCriteriaEntity";

export const profileValidator = [
    body("name")
        .isString()
        .notEmpty()
        .withMessage("Nazwa profilu jest wymagana."),
    body("capacity")
        .isInt({min: 1})
        .withMessage("Ilość miejsc musi być większa od zera"),
    body("criteria.*.subjectId")
        .isInt()
        .withMessage("Kryteria muszą mieć prawidłowe id przedmiotu"),
    body("criteria.*.type")
        .isString()
        .notEmpty()
        .isIn(["mandatory", "alternative"])
        .withMessage(`Typ kryterium jest "mandatory" albo "alternative"`),
    body("criteria").custom((criteria) => {
        if (!Array.isArray(criteria)) throw new Error("Kryteria muszą być tablicą.");

        const mandatoryCount = criteria.filter(criterion => criterion.type === ProfileCriteriaType.Mandatory).length;
        const alternativeCount = criteria.filter(criterion => criterion.type === ProfileCriteriaType.Alternative).length;

        if (alternativeCount > 0 && mandatoryCount != 3)
            throw new Error("Jeżeli jakiś przedmiot jest oznaczony jako alternatywny, obowiązują 3 przedmioty obowiązkowe.");
        if (mandatoryCount > 4)
            throw new Error("Można dodać maksymalnie 4 przedmioty obowiązkowe.");

        return true;
    })
];