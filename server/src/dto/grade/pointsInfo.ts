import {ProfileCriteriaType} from "../../models/profileCriteriaEntity";

export interface PointsInfo {
    points: number
    gradesInfo: GradesInfo[]
}

export interface GradesInfo {
    grade: number,
    subject: string,
    type: ProfileCriteriaType
}