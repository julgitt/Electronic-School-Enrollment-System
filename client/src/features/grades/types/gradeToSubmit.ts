import {GradeType} from "./gradeType.ts";

export interface GradeToSubmit {
    subjectId: number
    grade: number
    type: GradeType
}