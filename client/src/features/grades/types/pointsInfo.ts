import {ProfileCriteriaType} from "../../schoolAdmin/types/profileRequest.ts";

export interface PointsInfo {
    points: number
    gradesInfo: GradesInfo[]
}

export interface GradesInfo {
    grade: number,
    subject: string,
    type: ProfileCriteriaType
}