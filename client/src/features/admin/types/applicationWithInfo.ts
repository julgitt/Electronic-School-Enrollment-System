import {ProfileWithInfo} from "../../educationalOffer/types/profileWithInfo.ts";
import {Candidate} from "../../../shared/types/candidate.ts";

export interface ApplicationWithInfo {
    id: number;
    candidate: Candidate;
    profile: ProfileWithInfo;
    points: number;
    priority: number;
    status: string;
}
