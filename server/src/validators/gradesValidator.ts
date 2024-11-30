import { body } from 'express-validator';

export const gradesValidator = [
    body("grades")
        .isArray()
        .bail()
        .custom((grades: { subject: string, grade: number, type: string }[]) => {
            for (const grade of grades) {
                if (grade.type != "exam" && grade.type != "certificate") {
                    throw Error("Wrong type of grade. It should be the type of exam or school certificate.")
                }
                if (grade.type == "certificate" && grade.grade > 6 || grade.grade <= 0) {
                    throw Error("Grades from the school certificate should be the number between 1 and 6.")
                }
                if(grade.type == "exam" && grade.grade < 0 || grade.grade > 100) {
                    throw Error("Grades from the exam should be the number between 0 and 100.")
                }
            }
            return true;
        }).withMessage("Oceny ze świadectwa muszą być liczbami od 1 do 6, a z egzaminu - procentami od 0 do 100."),
];
