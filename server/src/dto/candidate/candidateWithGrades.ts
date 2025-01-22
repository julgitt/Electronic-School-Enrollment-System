import { Grade } from "../grade/grade";
import { Candidate } from "./candidate";

export interface CandidateWithGrades {
    candidate: Candidate,
    grades: Grade[]
}