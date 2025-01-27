import {body} from "express-validator";

export const enrollmentValidator = [
    body()
        .isArray()
        .bail()
        .custom((enrollments: { round: number, startDate: Date, endDate: Date }[]) => {
            for (const enrollment of enrollments) {
                if (enrollment.endDate <= enrollment.startDate)
                    throw new Error("Data rozpoczęcia musi być przed datą zakończenia");

                if (enrollment.round < 1 || enrollment.round % 1 !== 0)
                    throw Error("Tura musi być liczbą całkowitą większą od zera.");
                return true;
            }
        }).withMessage("Terminy naboru zostały podane w niepoprawnym formacie.")
];
