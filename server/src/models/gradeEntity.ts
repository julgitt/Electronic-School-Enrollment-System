import {GradeType} from "../dto/grade/gradeType";

export interface GradeEntity {
    candidateId: number,
    subjectId: number,
    grade: number,
    type: GradeType
}