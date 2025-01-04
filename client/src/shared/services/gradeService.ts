import {GradeToSubmit} from "../../features/grades/types/gradeToSubmit.ts";

export const submitGrades = async (
    grades: GradeToSubmit[],
) => {

    if (grades.find(g => g.grade === 0))
        throw Error("Uzpełnij wszystkie pola");

    const response = await fetch('/api/grades', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(grades),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Błąd podczas składania aplikacji.');
    }

    return data;
}