import React from "react";
import styles from "../../../assets/css/forms.module.scss";
import {InputField} from "../../../components/atomic/InputField";
import {Subject} from "../types/subject.ts";
import {Grade} from "../types/grade.ts";
import {GradeType} from "../types/gradeType.ts";


const GradeInputGroup: React.FC<{
    subjects: Subject[];
    grades: Grade[];
    type: GradeType;
    onGradesChange: (grade: Grade) => void;
    title: string;
}> = ({subjects, grades, type, onGradesChange, title}) => (
    <div>
        <h4>{title}</h4>
        {subjects
            .filter(subject => type === GradeType.Certificate || subject.isExamSubject)
            .map((subject) => {
                const gradeValue = grades.find(
                    (g) => g.subject.id === subject.id && g.type === type
                )?.grade ?? 0;

                return (
                    <div key={subject.id} className={styles.formInputGroupHorizontal}>
                        <h6 className={styles.labelItem}>{subject.name}:</h6>
                        <InputField
                            type="number"
                            min={1}
                            max={type == GradeType.Exam ? 100 : 6}
                            value={gradeValue}
                            onChange={(e) =>
                                onGradesChange({
                                    subject,
                                    grade: Number(e.target.value),
                                    type,
                                })
                            }
                            placeholder="0"
                            width={type == GradeType.Exam ? "78px" : "65px"}
                            height="20px"
                        />
                    </div>
                );
            })}
    </div>
);

export default GradeInputGroup;