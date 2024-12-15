import {GradeType} from "./gradeType";

export interface GradeRequest {
    subjectId: number,
    grade: number,
    type: GradeType
}