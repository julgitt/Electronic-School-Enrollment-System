import React, {useEffect, useState} from 'react';
import {Grade} from "../types/grade.ts";
import {Subject} from "../types/subject.ts";
import {GradeToSubmit} from "../types/gradeToSubmit.ts";
import {submitGrades} from "../services/gradeService.ts";

export const useGradeForm = (subjects: Subject[]) => {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (subjects.length > 0 && grades.length == 0) {
            const initialGrades: Grade[] = subjects.flatMap((subject) => {
                const certificateGrade = {
                    subject: subject,
                    grade: 0,
                    type: "certificate",
                };

                return subject.isExamSubject
                    ? [certificateGrade, {subject: subject, grade: 0, type: "exam"}]
                    : [certificateGrade];
            });

            setGrades(initialGrades);
        }
    }, [subjects]);


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        const gradesToSubmit: GradeToSubmit[] = grades.map(g => ({
            subjectId: g.subject.id,
            grade: g.grade,
            type: g.type
        }));

        try {
            const data = await submitGrades(gradesToSubmit);
            window.location.href = data.redirect || '/';
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGradesChange = (updatedGrade: Grade) => {
        setGrades((prevGrades) =>
            prevGrades.map((grade) =>
                grade.subject.id === updatedGrade.subject.id && grade.type === updatedGrade.type
                    ? updatedGrade
                    : grade
            )
        );
    };

    return {
        grades,
        error,
        loading,
        handleSubmit,
        handleGradesChange
    };
};
