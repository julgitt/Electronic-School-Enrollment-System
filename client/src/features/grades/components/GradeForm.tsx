import React from "react";

import styles from "../../../assets/css/forms.module.scss";
import {ErrorMessage} from "../../../components/atomic/ErrorMessage";
import {Button} from "../../../components/atomic/Button";
import {Subject} from "../types/subject.ts";
import {Grade} from "../types/grade.ts";
import GradeInputGroup from "./GradeInputGroup.tsx";
import {GradeType} from "../types/gradeType.ts";

interface GradeFormProps {
    subjects: Subject[];
    grades: Grade[];
    error: string | null;
    loading: boolean;
    onGradesChange: (grade: Grade) => void;
    onSubmit: (event: React.FormEvent) => void;
}

const GradeForm: React.FC<GradeFormProps> = ({
                                                 subjects,
                                                 grades,
                                                 error,
                                                 loading,
                                                 onGradesChange,
                                                 onSubmit,
                                             }) => (
    <form method="POST" onSubmit={onSubmit} className={styles.form}>
        {error && <ErrorMessage message={error}/>}
        <h3>Wpisz swoje wyniki:</h3>
        <div className={styles.formInputGroupHorizontal}>
            <GradeInputGroup
                subjects={subjects.filter((s) => s.isExamSubject)}
                grades={grades}
                type={GradeType.Exam}
                onGradesChange={onGradesChange}
                title="Z egzaminu"
            />
            <GradeInputGroup
                subjects={subjects}
                grades={grades}
                type={GradeType.Certificate}
                onGradesChange={onGradesChange}
                title="Ze świadectwa"
            />
        </div>
        <div>
            <Button type="submit" disabled={loading}>Wyślij</Button>
        </div>
    </form>
)

export default GradeForm;
