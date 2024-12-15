import {Subject} from "./subject.ts";
import {GradeType} from "./gradeType.ts";

export interface Grade {
    subject: Subject
    grade: number
    type: GradeType
}