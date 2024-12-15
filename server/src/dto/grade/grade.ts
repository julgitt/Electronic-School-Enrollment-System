import {GradeType} from "./gradeType";

export interface Grade {
    subjectId: number,
    grade: number,
    type: GradeType,
}