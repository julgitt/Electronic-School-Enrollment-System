import {body} from 'express-validator';
import {GradeType} from "../dto/grade/gradeType";

export const gradesValidator = [
    body()
        .isArray()
        .bail()
        .custom((grades: { subject: string, grade: number, type: GradeType }[]) => {
            for (const grade of grades) {
                if (grade.type == GradeType.Certificate && grade.grade > 6 || grade.grade <= 0) {
                    throw Error("Oceny ze świadectwa muszą być numerem z przedziału [1, 6].")
                }
                if (grade.type == GradeType.Exam && grade.grade < 0 || grade.grade > 100) {
                    throw Error("Oceny z egzaminu muszą być numerem z przedziału [0, 100].")
                }
            }
            return true;
        }).withMessage("Oceny ze świadectwa muszą być liczbami od 1 do 6, a z egzaminu - procentami od 0 do 100."),
];
