import React from "react";

import styles from "../../../assets/css/forms.module.scss";
import {InputField} from "../../../components/atomic/InputField";
import {ErrorMessage} from "../../../components/atomic/ErrorMessage";
import {Button} from "../../../components/atomic/Button";
import {Subject} from "../types/subject.ts";
import {Grade} from "../types/grade.ts";

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
        <h3>Wpisz swoje wyniki:</h3>
        {error && <ErrorMessage message={error} />}
        <div className={styles.formInputGroupHorizontal}>
            <div className={styles.formInputGroup}>
            <h4>z egzaminu</h4>
            {subjects
                .filter(subject => subject.isExamSubject)
                .map((subject, index) => {
                    const name = subject.name;

                    return (
                        <div key={index} className={styles.formInputGroupHorizontal}>
                            <h5 className={styles.profileName}> {name}: </h5>
                            <InputField
                                type="number"
                                min={1}
                                value={grades.find((g) => g.subject.id === subject.id)?.grade ?? 0}
                                onChange={(e) =>
                                    onGradesChange({subject: subject, grade: Number(e.target.value), type: "exam"})}
                                placeholder="0"
                                width="75px"
                                height="20px"
                            />
                        </div>
                    )
                })
            }
            </div>
            <div className={styles.formInputGroup}>
                <h4>ze świadectwa</h4>
                    {subjects.map((subject, index) => {
                        const name = subject.name;
                        return (
                            <div key={index} className={styles.formInputGroupHorizontal}>
                                <h5 className={styles.profileName}> {name}: </h5>
                                <InputField
                                    type="number"
                                    min={1}
                                    value={grades.find((g) => g.subject.id === subject.id)?.grade ?? 0}
                                    onChange={(e) =>
                                        onGradesChange({
                                            subject: subject,
                                            grade: Number(e.target.value),
                                            type: "school certificate"
                                        })}
                                    placeholder="0"
                                    width="75px"
                                    height="20px"
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
            <div>
                <Button type="submit" disabled={loading}>Wyślij</Button>
        </div>
    </form>
)

export default GradeForm;
